// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const bodyArray = await req.arrayBuffer();
  const buf = Buffer.from(bodyArray);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Haal giftId uit metadata
    const giftIdString = session.metadata?.giftId;
    // Betaalbedrag in centen
    const amount = session.amount_total ?? 0;

    if (giftIdString) {
      const giftId = parseInt(giftIdString, 10);
      // Prisma-update: giftId -> totalPaidCents + amount
      await prisma.gift.update({
        where: { id: giftId },
        data: {
          totalPaidCents: {
            increment: amount,
          },
        },
      });
      console.log(`Cadeau #${giftId} is +${amount} cent bijgewerkt!`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
