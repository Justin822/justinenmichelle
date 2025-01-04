// app/success/page.tsx

"use client";
// of je kunt een server component maken en de session_id via searchParams ophalen.
// Hier doen we het clientside voorbeeld:

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface SessionData {
  id: string;
  amount_total: number;
  // evt. andere velden:
  // payment_status?: string;
  // metadata?: { [key: string]: any };
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/checkout-sessions/retrieve?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSessionData(data.session);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) return <p>Bezig met laden...</p>;
  if (!sessionData) return <p>Geen gegevens gevonden.</p>;

  return (
    <div>
      <h1>Betaling geslaagd!</h1>
      <p>Session ID: {sessionData.id}</p>
      <p>Totaal: €{(sessionData.amount_total / 100).toFixed(2)}</p>
      {/* etc. */}
    </div>
  );
}
