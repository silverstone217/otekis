"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { OrderWithProductDetails } from "@/actions/myOrderAction";
import { useRouter } from "next/navigation";

interface GenerateSecretProps {
  orderId: string;
  myOrder: OrderWithProductDetails;
}

export default function GenerateSecret({
  orderId,
  myOrder,
}: GenerateSecretProps) {
  const [secret, setSecret] = useState<string | null>(
    myOrder.ValidationCode ?? null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateSecret = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        throw new Error("Erreur lors de la génération du code secret");
      }

      const data = await res.json();
      setSecret(data.secret);
      toast.success("Code secret généré !");
      router.refresh();
      //   location.reload();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Code secret copié !");
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const qrValue = secret
    ? `${window.location.origin}/validation?order=${encodeURIComponent(
        orderId
      )}&secret=${encodeURIComponent(secret)}`
    : "";

  return (
    <Card className="w-full p-4 space-y-6 bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {!myOrder.ValidationCode
            ? "Générer un code secret"
            : "Votre code secret"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {!myOrder.ValidationCode && (
          <Button
            onClick={generateSecret}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Génération en cours..." : "Générer le code secret"}
          </Button>
        )}

        {secret && (
          <>
            <QRCodeSVG value={qrValue} size={180} marginSize={4} />

            <div className="flex items-center gap-2 mt-4">
              <code className="select-all text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                {secret}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                aria-label="Copier le code secret"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
