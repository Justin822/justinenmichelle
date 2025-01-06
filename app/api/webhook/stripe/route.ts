import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import NotificationEmail from "@/components/emails/NotificationEmail";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const resend = new Resend(process.env.RESEND_API_KEY!);

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

    const giftIdString = session.metadata?.giftId;
    const message = session.metadata?.message ?? "";
    const email = session.customer_details?.email || "unknown@example.com";
    const name = session.customer_details?.name || "Anonymous";
    const amount = session.amount_total ?? 0;

    if (giftIdString) {
      const giftId = parseInt(giftIdString, 10);

      const gift = await prisma.gift.update({
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
        include: {
          messages: true,
        },
      });

      console.log(`Gift #${giftId} updated successfully!`);

      // Send email notification using Resend
      await resend.emails.send({
        from: "Justin Kuijpers <justin@justinenmichelle.nl>",
        to: "justin@justinkuijpers.com",
        subject: `New Gift Contribution for "${gift.title}"`,
        react: NotificationEmail({
          giftTitle: gift.title,
          message,
          name,
          email,
          amountPaid: amount,
          totalPaid: gift.totalPaidCents,
          goalAmount: gift.maxCents,
        }),
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
