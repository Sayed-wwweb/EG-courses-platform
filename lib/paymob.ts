import crypto from "crypto";
import { env } from "@/lib/env";

const PAYMOB_BASE_URL = "https://accept.paymob.com";

interface CreateIntentionInput {
  amountCents: number;
  merchantOrderId: string;
  billingData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  redirectionUrl: string;
}

export async function createPaymobIntention({
  amountCents,
  merchantOrderId,
  billingData,
  redirectionUrl,
}: CreateIntentionInput) {
  const response = await fetch(`${PAYMOB_BASE_URL}/v1/intention/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.PAYMOB_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountCents,
      currency: "EGP",
      payment_methods: [
        Number(env.PAYMOB_CARD_INTEGRATION_ID),
        Number(env.PAYMOB_WALLET_INTEGRATION_ID),
        Number(env.PAYMOB_KIOSK_INTEGRATION_ID),
      ],
      items: [],
      billing_data: {
        first_name: billingData.firstName,
        last_name: billingData.lastName,
        email: billingData.email,
        phone_number: billingData.phoneNumber,
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        postal_code: "NA",
        city: "Cairo",
        state: "Cairo",
        country: "EG",
        shipping_method: "NA",
      },
      customer: {
        first_name: billingData.firstName,
        last_name: billingData.lastName,
        email: billingData.email,
      },
      merchant_order_id: merchantOrderId,
      redirection_url: redirectionUrl,
      delivery_needed: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Paymob create intention failed:", errText);
    throw new Error("Failed to create payment intention");
  }

  return response.json() as Promise<{ client_secret: string; id: number }>;
}

const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function verifyPaymobHmac(
  transactionObj: Record<string, unknown>,
  receivedHmac: string
): boolean {
  const concatenated = HMAC_FIELDS.map((field) => {
    const value = getNestedValue(transactionObj, field);
    return value === null || value === undefined ? "" : String(value);
  }).join("");

  const computedHmac = crypto
    .createHmac("sha512", env.PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest("hex");

  return computedHmac === receivedHmac;
}