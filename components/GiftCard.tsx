"use client";

import { Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

interface GiftCardProps {
  id: number; // Unieke ID van het cadeau (in DB)
  title: string;
  description: string;
  image: string;
  max: number; // Doelbedrag (bijv. 500)
  paid: number; // Hoeveel er al is betaald (bijv. 0, 100, etc.)
}

// Laad je publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function GiftCard({
  id,
  title,
  description,
  image,
  max,
  paid,
}: GiftCardProps) {
  const [open, setOpen] = useState(false); // of type boolean
  const [amount, setAmount] = useState<number>(0); // user kiest bedrag op de kaart
  const [message, setMessage] = useState<string>(""); // user voegt bericht toe in drawer

  const isFullyPaid = paid >= max;

  // Deze functie wordt aangeroepen als men definitief naar Stripe wil
  async function handleCheckout() {
    try {
      if (isFullyPaid || amount <= 0) {
        // Geen betaling mogelijk of bedrag te laag
        return;
      }
      const stripe = await stripePromise;
      const response = await fetch("/api/checkout-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chosenAmount: amount, // ingevoerde bedrag (vanaf de kaart)
          giftId: id, // welk cadeau
          message, // persoonlijke boodschap uit de drawer
          returnUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      if (data.sessionId) {
        // Redirect naar Stripe
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        console.error("Er ging iets mis:", data.error);
      }
    } catch (error) {
      console.error("Fout bij aanmaken Checkout Session:", error);
    }
  }

  // Toon drawer alleen als er een bedrag is ingevuld
  function openDrawer() {
    if (!isFullyPaid && amount > 0) {
      setOpen(true);
    } else {
      // Eventueel feedback geven als men 0 bedrag heeft geselecteerd
      console.log("Kies eerst een geldig bedrag > 0");
    }
  }

  // Sluit drawer en ga naar checkout
  function handleDrawerCheckout() {
    setOpen(false);
    handleCheckout();
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-rose-100/50">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-serif text-2xl text-rose-800">
          {title}
        </CardTitle>
        <CardDescription className="font-medium text-rose-600">
          €{paid.toFixed(2)} van €{max.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground leading-relaxed">{description}</p>

        {/* Invoerveld voor bedrag (alleen tonen als nog niet volledig betaald) */}
        {!isFullyPaid && (
          <div className="mt-4">
            <label className="block mb-1">Kies je eigen bedrag (in EUR):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Bijv. 50"
              className="border p-2 rounded w-full max-w-[200px] mx-auto"
              min={0}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pb-6">
        {isFullyPaid ? (
          // Als het limiet al bereikt is
          <Button
            disabled
            className="rounded-full bg-gray-400 cursor-not-allowed"
          >
            Volledig betaald
          </Button>
        ) : (
          // Anders de "Kies cadeau"-knop -> opent Drawer
          <Button
            onClick={openDrawer}
            className="rounded-full bg-rose-600 hover:bg-rose-700"
          >
            <Heart className="mr-2 h-4 w-4" />
            Kies cadeau
          </Button>
        )}
      </CardFooter>

      {/* DRAWER: enkel als nog niet fully paid */}
      <Drawer open={open} onOpenChange={setOpen}>
        {/* Overlay + Drawer Content */}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Persoonlijk bericht</DrawerTitle>
            <DrawerDescription>
              Voeg een bericht toe voor de bruiloft
            </DrawerDescription>
          </DrawerHeader>

          <div className="grid gap-4 py-4">
            <label>
              Je bericht:
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border p-2 rounded w-full"
                rows={3}
              />
            </label>
          </div>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleDrawerCheckout}>
              Doorgaan naar betaling
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
