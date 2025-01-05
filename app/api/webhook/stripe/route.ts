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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the metadata and session fields
    const giftIdString = session.metadata?.giftId;
    const message = session.metadata?.message ?? "";
    const email = session.customer_email; // Customer's email
    const name = session.shipping?.name || session.customer_details?.name || ""; // Name from Stripe session
    const amount = session.amount_total ?? 0; // Amount in cents

    if (giftIdString) {
      const giftId = parseInt(giftIdString, 10);
      // Save the payment details to the database
      await prisma.gift.update({
        where: { id: giftId },
        data: {
          totalPaidCents: {
            increment: amount,
          },
          messages: {
            create: {
              message,
              email,
              name,
            },
          },
        },
      });
      console.log(`Cadeau #${giftId} updated with +${amount} cents.`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
