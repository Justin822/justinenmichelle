// app/success/page.tsx

import { Suspense } from "react";
import SuccessClient from "../../components/SuccesClient";

// LET OP: Geen "use client" hier. Dit is een server component.

export default function SuccessPage() {
  return (
    // We wikkelen de client component in <Suspense>
    <Suspense fallback={<p>Loading...</p>}>
      <SuccessClient />
    </Suspense>
  );
}
