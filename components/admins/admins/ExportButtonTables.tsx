"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/UserAuth";

export default function ExportButtonTbales() {
  const [loading, setLoading] = useState(false);
  const user = useCurrentUser();

  if (!user || user.role !== "super_admin") return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admins/tables");

      if (!res.ok) throw new Error("Échec export");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.zip`;
      a.click();
      a.remove();

      toast.success("✅ Export réussi !");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 font-medium px-4 py-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exportation en cours...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Télécharger les tables
        </>
      )}
    </Button>
  );
}
