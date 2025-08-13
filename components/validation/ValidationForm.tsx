"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { validationOrder } from "@/actions/validationAction";
import { useRouter } from "next/navigation";

interface ValidationFormProps {
  initialOrderId?: string;
  initialSecret?: string;
}

export default function ValidationForm({
  initialOrderId = "",
  initialSecret = "",
}: ValidationFormProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [secret, setSecret] = useState(initialSecret);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    setOrderId(initialOrderId);
    setSecret(initialSecret);
  }, [initialOrderId, initialSecret]);

  const validateInputs = () => {
    return orderId.trim().length > 0 && secret.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccess(null);

    try {
      const formData = { orderId, secret };

      const res = await validationOrder(formData);

      if (res.error) {
        setSuccess(false);
        setErrorMessage(res.message || "Erreur inconnue");
        toast.error(res.message || "Erreur lors de la validation");
        return;
      }

      setSuccess(true);
      toast.success("Commande validée avec succès !");
      setOrderId("");
      setSecret("");
      router.refresh();
    } catch (error) {
      setSuccess(false);
      setErrorMessage("Erreur réseau, veuillez réessayer.");
      toast.error("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full bg-white p-6 rounded-lg shadow-md space-y-6"
      noValidate
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Validation de la livraison
      </h1>
      <div>
        <Label htmlFor="orderId" className="font-semibold">
          Numéro de commande
        </Label>
        <Input
          id="orderId"
          type="text"
          placeholder="Entrez le numéro de commande"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="secret" className="font-semibold">
          Code secret client
        </Label>
        <Input
          id="secret"
          type="password"
          placeholder="Entrez le code secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        className="w-full flex justify-center items-center gap-2"
        disabled={!validateInputs() || loading}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        ) : (
          "Valider"
        )}
      </Button>

      {success === true && (
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <CheckCircle2 className="w-6 h-6" />
          Livraison validée avec succès !
        </div>
      )}
      {success === false && (
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <XCircle className="w-6 h-6" />
          {errorMessage}
        </div>
      )}
    </form>
  );
}
