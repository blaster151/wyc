"use client";

import { useRouter } from "next/navigation";
import AffirmationFlow from "@/components/AffirmationFlow";

export default function AffirmationsPage() {
  const router = useRouter();

  return (
    <AffirmationFlow onComplete={() => router.push("/support")} />
  );
}
