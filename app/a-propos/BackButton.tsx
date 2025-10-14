"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="font-semibold hover:underline underline-offset-2 flex items-center gap-1"
    >
      <ArrowLeft size={16} />
      Retour
    </button>
  );
}
