import { createHash, randomUUID } from "crypto";
import { prisma } from "@/db/client";
import { AppError } from "@/errors/app-error";
import type { BillingCycle } from "@prisma/client";
import {
  computePremiumPricing,
  type BillingCycle as PricingCycle,
} from "@/config/premium-pricing";

/** URL base del checkout de Wompi (redirect, no API) */
const WOMPI_CHECKOUT_URL = "https://checkout.wompi.co/p/";

function asBillingCycle(cycle: PricingCycle): BillingCycle {
  return cycle as BillingCycle;
}

function getWompiKeys() {
  const publicKey    = process.env.WOMPI_PUBLIC_KEY;
  const privateKey   = process.env.WOMPI_PRIVATE_KEY;
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  const redirectUrl  = process.env.WOMPI_REDIRECT_URL;

  if (!publicKey || !privateKey || !eventsSecret || !integrityKey || !redirectUrl) {
    throw new AppError(
      "Variables de entorno de Wompi no configuradas",
      500,
      "WOMPI_CONFIG_MISSING"
    );
  }

  return { publicKey, privateKey, eventsSecret, integrityKey, redirectUrl };
}

/**
 * Public: precios calculados en servidor (landing / upgrade).
 */
function getPublicPricing() {
  const monthly = computePremiumPricing("MONTHLY");
  const yearly = computePremiumPricing("YEARLY");
  return { monthly, yearly };
}

/**
 * Genera la URL de checkout de Wompi (redirect) con firma de integridad y registra
 * la suscripción como PENDING. No realiza llamadas a la API de Wompi — usa el
 * flujo de checkout redirect con signature:integrity para máxima seguridad.
 *
 * Fórmula de integridad: SHA256(reference + amountCents + "COP" + integrityKey)
 */
async function createCheckout(
  userId: string,
  email: string,
  billingCycle: BillingCycle
): Promise<{
  paymentUrl: string;
  reference: string;
  amountCents: number;
  billingCycle: BillingCycle;
}> {
  const pricing = computePremiumPricing(billingCycle as PricingCycle);
  const { publicKey, integrityKey, redirectUrl } = getWompiKeys();

  const amountCents = pricing.finalAmountCents;
  const currency    = "COP";
  const reference   = `LUKAPP-${randomUUID()}`;

  // Firma de integridad: SHA256(reference + amountCents + currency + integrityKey)
  const integrityHash = createHash("sha256")
    .update(`${reference}${amountCents}${currency}${integrityKey}`)
    .digest("hex");

  // URL de checkout Wompi — el usuario paga aquí y vuelve a redirectUrl
  const params = new URLSearchParams({
    "public-key":          publicKey,
    currency,
    "amount-in-cents":     String(amountCents),
    reference,
    "signature:integrity": integrityHash,
    "redirect-url":        redirectUrl,
    "customer-data:email": email,
  });
  const paymentUrl = `${WOMPI_CHECKOUT_URL}?${params.toString()}`;

  const now = new Date();
  const planExpiresAt = new Date(now);
  planExpiresAt.setDate(planExpiresAt.getDate() + pricing.durationDays);

  const nextBillingAt = new Date(planExpiresAt);
  nextBillingAt.setDate(nextBillingAt.getDate() - 3);

  // wompiTxId = reference como placeholder; el webhook lo actualizará con el ID real de Wompi
  await prisma.subscription.create({
    data: {
      userId,
      wompiTxId: reference,
      wompiRef:  reference,
      status:    "PENDING",
      billingCycle:    asBillingCycle(pricing.billingCycle),
      discountPercent: pricing.discountPercent,
      baseAmountCents: pricing.baseAmountCents,
      amountCents,
      planStartsAt:  now,
      planExpiresAt,
      autoRenew:     true,
      nextBillingAt,
    },
  });

  return {
    paymentUrl,
    reference,
    amountCents,
    billingCycle: asBillingCycle(pricing.billingCycle),
  };
}

async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "APPROVED",
      planExpiresAt: { gt: new Date() },
    },
    orderBy: { planExpiresAt: "desc" },
    select: {
      id: true,
      billingCycle: true,
      amountCents: true,
      baseAmountCents: true,
      discountPercent: true,
      planStartsAt: true,
      planExpiresAt: true,
      autoRenew: true,
      cancelledAt: true,
      nextBillingAt: true,
    },
  });
}

async function cancelAutoRenew(userId: string): Promise<void> {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: "APPROVED", planExpiresAt: { gt: new Date() } },
    orderBy: { planExpiresAt: "desc" },
  });

  if (!sub) {
    throw new AppError("No tienes una suscripción activa", 404, "NO_ACTIVE_SUB");
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { autoRenew: false, cancelledAt: new Date() },
  });
}

/** Tipo del payload de evento Wompi */
type WompiEventPayload = {
  event: string;
  data: Record<string, unknown>;
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
};

/**
 * Valida la firma de un evento Wompi.
 *
 * Algoritmo oficial (docs.wompi.co):
 *   1. Para cada prop en signature.properties → extraer valor de data (dot notation)
 *   2. Concatenar: valor1 + valor2 + ... + timestamp + eventsSecret
 *   3. SHA256(concatenación).toUpperCase() debe coincidir con signature.checksum
 */
function validateWompiEventSignature(
  payload: WompiEventPayload,
  eventsSecret: string
): boolean {
  const { signature, timestamp, data } = payload;

  let concat = "";
  for (const propPath of signature.properties) {
    // Navegar la ruta dot notation (ej: "transaction.id" → data.transaction.id)
    const keys = propPath.split(".");
    let value: unknown = data;
    for (const key of keys) {
      value = (value as Record<string, unknown>)[key];
    }
    concat += String(value ?? "");
  }
  concat += String(timestamp);
  concat += eventsSecret;

  const calculated = createHash("sha256").update(concat).digest("hex").toUpperCase();
  return calculated === signature.checksum.toUpperCase();
}

/**
 * Webhook Wompi — rawBody debe ser el string exacto del cuerpo (para parseo fiel).
 * La validación usa el algoritmo oficial de Wompi basado en signature.properties.
 */
async function handleWebhook(
  rawBody: string,
  _headerChecksum: string | undefined,
  _legacyChecksum: string | undefined
): Promise<void> {
  const { eventsSecret } = getWompiKeys();

  let event: WompiEventPayload & {
    data: {
      transaction: {
        id: string;
        reference: string;
        status: string;
        amount_in_cents: number;
      };
    };
  };

  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    throw new AppError("Cuerpo de webhook inválido", 400, "WEBHOOK_BAD_JSON");
  }

  // Validar firma con el algoritmo oficial de Wompi
  if (!event.signature?.properties || !event.signature?.checksum || !event.timestamp) {
    throw new AppError("Firma de webhook ausente o malformada", 400, "WEBHOOK_NO_SIGNATURE");
  }

  const isValid = validateWompiEventSignature(event, eventsSecret);
  if (!isValid) {
    console.error("[Webhook Wompi] Checksum inválido:", {
      expected: (() => {
        let concat = "";
        for (const p of event.signature.properties) {
          const keys = p.split(".");
          let v: unknown = event.data;
          for (const k of keys) v = (v as Record<string, unknown>)[k];
          concat += String(v ?? "");
        }
        concat += String(event.timestamp) + eventsSecret;
        return createHash("sha256").update(concat).digest("hex").toUpperCase();
      })(),
      received: event.signature.checksum,
    });
    throw new AppError("Firma de webhook inválida", 401, "WEBHOOK_INVALID_SIGNATURE");
  }

  if (event.event !== "transaction.updated") return;

  const tx = event.data?.transaction;
  if (!tx?.reference || !tx?.status) return;

  const { id: wompiTxId, reference: wompiRef, status } = tx;

  const subscription = await prisma.subscription.findUnique({
    where: { wompiRef },
  });

  if (!subscription) return;

  // Idempotencia: evitar re-activar si ya aprobado
  if (subscription.status === "APPROVED" && status === "APPROVED") {
    return;
  }

  const pricing = computePremiumPricing(subscription.billingCycle as PricingCycle);

  if (status === "APPROVED") {
    const now = new Date();
    const planExpiresAt = new Date(now);
    planExpiresAt.setDate(planExpiresAt.getDate() + pricing.durationDays);

    const nextBillingAt = new Date(planExpiresAt);
    nextBillingAt.setDate(nextBillingAt.getDate() - 3);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { wompiRef },
        data: {
          wompiTxId,
          status: "APPROVED",
          planStartsAt: now,
          planExpiresAt,
          nextBillingAt,
        },
      }),
      prisma.profile.update({
        where: { userId: subscription.userId },
        data: { plan: "PREMIUM", planActivatedAt: now, planExpiresAt },
      }),
    ]);
  } else if (
    status === "DECLINED" ||
    status === "VOIDED" ||
    status === "ERROR"
  ) {
    await prisma.subscription.update({
      where: { wompiRef },
      data: {
        wompiTxId,
        status: status as "DECLINED" | "VOIDED" | "ERROR",
      },
    });
  }
}

export const subscriptionService = {
  getPublicPricing,
  createCheckout,
  getActiveSubscription,
  cancelAutoRenew,
  handleWebhook,
};
