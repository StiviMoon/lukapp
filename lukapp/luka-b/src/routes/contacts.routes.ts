import { Router, Request, Response } from "express";
import { authenticate } from "@/auth/middleware";
import { validateBody, validateParams } from "@/middleware/validation";
import { inviteContactSchema, contactIdSchema } from "@/validations/contact.schema";
import { contactService } from "@/services/contact.service";
import { formatError } from "@/errors/error-handler";

const router = Router();

router.use(authenticate);

/**
 * POST /api/contacts/invite
 * Invita a un usuario por email
 */
router.post(
  "/invite",
  validateBody(inviteContactSchema),
  async (req: Request, res: Response) => {
    try {
      const contact = await contactService.invite(req.userId!, req.body.email);
      res.status(201).json({ success: true, data: contact });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * GET /api/contacts
 * Lista todos los contactos del usuario
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const contacts = await contactService.getContacts(req.userId!);
    res.json({ success: true, data: contacts });
  } catch (error) {
    const e = formatError(error);
    res.status(e.statusCode).json({ success: false, error: e });
  }
});

/**
 * POST /api/contacts/:id/accept
 * Acepta una invitación
 */
router.post(
  "/:id/accept",
  validateParams(contactIdSchema),
  async (req: Request, res: Response) => {
    try {
      const contact = await contactService.accept(String(req.params.id), req.userId!);
      res.json({ success: true, data: contact });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

/**
 * DELETE /api/contacts/:id
 * Rechaza o elimina un contacto
 */
router.delete(
  "/:id",
  validateParams(contactIdSchema),
  async (req: Request, res: Response) => {
    try {
      await contactService.remove(String(req.params.id), req.userId!);
      res.json({ success: true, message: "Contacto eliminado" });
    } catch (error) {
      const e = formatError(error);
      res.status(e.statusCode).json({ success: false, error: e });
    }
  }
);

export default router;
