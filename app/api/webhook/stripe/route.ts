import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import formData from "form-data";
import Mailgun from "mailgun.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Setup Mailgun client
const mailgun = new Mailgun(formData);
const mailgunClient = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
  url: process.env.MAILGUN_API_URL || "https://api.mailgun.net",
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

      // Send email notification
      await sendEmailNotification({
        gift,
        message,
        email,
        name,
        amount,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// Email sending function using Mailgun
async function sendEmailNotification({
  gift,
  message,
  email,
  name,
  amount,
}: {
  gift: { title: string; totalPaidCents: number; maxCents: number };
  message: string;
  email: string;
  name: string;
  amount: number;
}) {
  try {
    const response = await mailgunClient.messages.create(
      process.env.MAILGUN_DOMAIN!,
      {
        from: process.env.MAILGUN_FROM!,
        to: process.env.MAILGUN_TO!, // Your email
        subject: `New Gift Contribution for "${gift.title}"`,
        html: `
          <h1>New Gift Contribution</h1>
          <p><strong>Gift:</strong> ${gift.title}</p>
          <p><strong>Amount Paid:</strong> €${(amount / 100).toFixed(2)}</p>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
          <hr />
          <p>Total Paid for "${gift.title}": €${(
          gift.totalPaidCents / 100
        ).toFixed(2)}</p>
          <p>Goal: €${(gift.maxCents / 100).toFixed(2)}</p>
        `,
      }
    );

    console.log("Email sent successfully!", response.id);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
