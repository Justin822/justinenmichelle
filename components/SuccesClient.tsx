// app/success/SuccessClient.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionData {
  id: string;
  amount_total: number;
  // etc.
}

export default function SuccessClient() {
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
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) return <p>Bezig met laden...</p>;
  if (!sessionData) return <p>Geen gegevens gevonden.</p>;

  return (
    <div>
      <h1>Betaling geslaagd (Suspense boundary)!</h1>
      <p>Session ID: {sessionData.id}</p>
      <p>Totaal: €{(sessionData.amount_total / 100).toFixed(2)}</p>
    </div>
  );
}
