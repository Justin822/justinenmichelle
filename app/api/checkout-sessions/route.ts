// app/api/checkout-sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { chosenAmount, giftId, message, returnUrl } = await request.json();
    const amountInCents = chosenAmount * 100;

    // Maak checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Gift #${giftId}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: "engraving",
          label: {
            type: "custom",
            custom: "Personalized engraving",
          },
          optional: false,
          type: "text",
          text: {
            value: "Jane",
          },
        },
      ],
      mode: "payment",
      success_url: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/cancel`,
      metadata: {
        giftId: String(giftId), // <-- Opslaan in metadata
        message: message ?? "",
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Als je niet weet wat het is, geef een generieke melding terug
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 400 }
    );
  }
}
