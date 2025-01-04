"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  // Hard-coded voorbeelditems
  const [products] = useState([
    {
      name: "Product 1",
      price: 10,
      quantity: 1,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Product 2",
      price: 20,
      quantity: 2,
      image: "https://via.placeholder.com/150",
    },
  ]);

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;

      // POST naar onze route: /api/checkout-sessions
      const res = await fetch("/api/checkout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: products,
          returnUrl: window.location.origin, // bv. https://localhost:3000
        }),
      });
      const data = await res.json();

      if (data.sessionId) {
        // Redirect naar Stripe
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        console.error("Er trad een fout op:", data);
      }
    } catch (error) {
      console.error("Checkout-fout:", error);
    }
  };

  return (
    <div>
      <h1>Checkout-pagina</h1>
      {products.map((p, idx) => (
        <div key={idx}>
          <h2>{p.name}</h2>
          <p>Prijs: ${p.price}</p>
          <p>Aantal: {p.quantity}</p>
        </div>
      ))}
      <button onClick={handleCheckout}>Afrekenen</button>
    </div>
  );
}
