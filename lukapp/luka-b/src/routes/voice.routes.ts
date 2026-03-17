import { Router, Request, Response } from "express";
import multer from "multer";
import Groq from "groq-sdk";
import { z } from "zod";
import { authenticate } from "@/auth/middleware";
import { validateBody } from "@/middleware/validation";
import { parseVoiceSchema } from "@/validations/voice.schema";
import { voiceService } from "@/services/voice.service";
import { formatError } from "@/errors/error-handler";
import { AppError } from "@/errors/app-error";
import { categoryRepository } from "@/repositories/category.repository";
import { accountRepository } from "@/repositories/account.repository";
import { transactionRepository } from "@/repositories/transaction.repository";
import { profileRepository } from "@/repositories/profile.repository";
import { TransactionType, AccountType } from "@prisma/client";

const router = Router();
router.use(authenticate);

// Multer: guarda el audio en memoria (no en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max (límite de Whisper)
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/voice/transcribe
 * Recibe un archivo de audio y lo transcribe con OpenAI Whisper
 */
router.post(
  "/transcribe",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        throw new AppError("No se recibió archivo de audio", 400, "NO_AUDIO");
      }

      const audioFile = new File([req.file.buffer], "recording.webm", {
        type: req.file.mimetype || "audio/webm",
      });

      const transcription = await groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3-turbo", // Más rápido y gratis en Groq
        language: "es",
        response_format: "text",
      });

      res.json({
        success: true,
        data: { transcript: transcription },
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

// Schema para guardar la transacción de voz
// categoryId puede llegar como null, undefined, UUID válido, o el string "null" (desde la IA)
const saveVoiceTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  suggestedCategoryName: z.string().min(1),
  categoryId: z
    .union([z.string().uuid(), z.null(), z.literal("null")])
    .optional()
    .transform((val) => (val === "null" ? null : val)),
});

/**
 * POST /api/voice/save
 * Guarda una transacción de voz con lógica de find-or-create de categoría:
 * - Si categoryId existe y es válido → lo usa
 * - Si no → busca categoría por nombre (case-insensitive) para evitar duplicados
 * - Si no existe → la crea
 * - Si no hay cuentas → crea "Efectivo" automáticamente
 * - Finalmente crea la transacción
 */
router.post(
  "/save",
  validateBody(saveVoiceTransactionSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const userEmail = req.user?.email ?? "";
      const { type, amount, description, suggestedCategoryName, categoryId } =
        req.body as z.infer<typeof saveVoiceTransactionSchema>;

      // 1. Garantizar que el perfil exista
      await profileRepository.upsert(userId, userEmail);

      // 2. Resolver cuenta: usar la primera activa o crear "Efectivo"
      let accounts = await accountRepository.findByUserId(userId);
      if (accounts.length === 0) {
        await accountRepository.create({
          name: "Efectivo",
          type: AccountType.CASH,
          balance: 0,
          isActive: true,
          profile: { connect: { userId } },
        });
        accounts = await accountRepository.findByUserId(userId);
      }
      const accountId = accounts[0].id;

      // 3. Resolver categoría: find-or-create por nombre, evita duplicados
      const txType = type as TransactionType;
      let resolvedCategoryId: string | null = null;

      // Si Groq ya devolvió un ID válido, verificar que exista y pertenezca al usuario
      if (categoryId) {
        const existing = await categoryRepository.findById(categoryId, userId);
        if (existing && existing.type === txType) {
          resolvedCategoryId = existing.id;
        }
      }

      // Si no hay ID válido, buscar por nombre o crear
      if (!resolvedCategoryId && suggestedCategoryName) {
        const category = await categoryRepository.findOrCreate(
          userId,
          suggestedCategoryName,
          txType
        );
        resolvedCategoryId = category.id;
      }

      // 4. Crear la transacción
      const transaction = await transactionRepository.create({
        type: txType,
        amount,
        description: description ?? suggestedCategoryName,
        date: new Date(),
        profile: { connect: { userId } },
        account: { connect: { id: accountId } },
        ...(resolvedCategoryId && {
          category: { connect: { id: resolvedCategoryId } },
        }),
      });

      // 5. Actualizar balance de la cuenta
      const balanceDelta =
        txType === TransactionType.INCOME
          ? amount
          : txType === TransactionType.EXPENSE
          ? -amount
          : 0;

      if (balanceDelta !== 0) {
        await accountRepository.updateBalance(accountId, userId, balanceDelta);
      }

      res.status(201).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

/**
 * POST /api/voice/parse
 * Parsea un transcript de voz a una transacción estructurada usando Groq
 */
router.post(
  "/parse",
  validateBody(parseVoiceSchema),
  async (req: Request, res: Response) => {
    try {
      const { transcript, categories } = req.body;

      const parsed = await voiceService.parseTranscript(transcript, categories);

      res.json({
        success: true,
        data: parsed,
      });
    } catch (error) {
      const formattedError = formatError(error);
      res.status(formattedError.statusCode).json({
        success: false,
        error: formattedError,
      });
    }
  }
);

export default router;
