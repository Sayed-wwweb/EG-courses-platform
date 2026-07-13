import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymobHmac } from "@/lib/paymob";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hmac = req.nextUrl.searchParams.get("hmac");

    if (body.type !== "TRANSACTION" || !hmac) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const transaction = body.obj;

    const isValid = verifyPaymobHmac(transaction, hmac);
    if (!isValid) {
      console.error("Paymob webhook: HMAC verification failed");
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const enrollmentId: string | undefined = transaction.order?.merchant_order_id;
    if (!enrollmentId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      console.error("Paymob webhook: enrollment not found for", enrollmentId);
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    if (transaction.success === true && transaction.pending === false) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "ACTIVE" },
      });
    } else if (transaction.success === false) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Paymob webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}