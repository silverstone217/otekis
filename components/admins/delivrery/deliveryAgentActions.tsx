"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2, Trash2, UserPlus } from "lucide-react";
import {
  addNewAgent,
  deleteAgentById,
  modifyAgentByID,
  modifyAgentType,
  newAgentType,
} from "@/actions/deliverymenActions";
import { DeliveryAgent } from "@prisma/client";

export type DeliveryManStats = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
};

export function AddDeliveryAgent() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    formData.name.trim().length > 2 &&
    (formData.email.trim() === "" || isValidEmail(formData.email)) &&
    formData.phone.trim().length >= 6 &&
    formData.address.trim().length > 3;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Veuillez remplir correctement tous les champs requis.");
      return;
    }

    setLoading(true);
    try {
      const newformData: newAgentType = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      const result = await addNewAgent(newformData);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      const newAgent = result.data;

      toast.success(`Agent ${newAgent?.name} ajouté avec succès !`);
      setOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
      //   if (newAgent) onAdded?.(newAgent);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de l'ajout de l'agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Ajouter un agent
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full rounded-lg p-6 bg-white text-gray-900 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Ajouter un nouvel agent de livraison
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-sm text-gray-600">
            Remplissez les informations ci-dessous pour créer un nouvel agent.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-4 flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@mail.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="812345678"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              minLength={9}
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              type="text"
              placeholder="14, isiro, gombe, kinshasa, rdc"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>

          <AlertDialogFooter className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={!canSubmit || loading}
              className="flex items-center gap-2"
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
                "Ajouter"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// MODIFY AGENT
type ModifyAgentProps = {
  agent: DeliveryAgent;
};

export function ModifyDeliveryAgent({ agent }: ModifyAgentProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: agent.name ?? "",
    email: agent.email ?? "",
    phone: agent.phone ?? "",
    address: agent.address ?? "",
  });

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    formData.name.trim().length > 2 &&
    (formData.email.trim() === "" || isValidEmail(formData.email)) &&
    formData.phone.trim().length >= 6 &&
    formData.address.trim().length > 3;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Veuillez remplir correctement tous les champs requis.");
      return;
    }

    setLoading(true);
    try {
      const newformData: modifyAgentType = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        id: agent.id,
      };

      const result = await modifyAgentByID(newformData);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      const updateAgent = result.data;

      setOpen(false);
      if (updateAgent)
        setFormData({
          name: updateAgent?.name,
          email: updateAgent?.email ?? "",
          phone: updateAgent?.phone,
          address: updateAgent?.address ?? "",
        });
      toast.success(`Agent ${updateAgent?.name} modifié avec succès !`);
      //   if (updateAgent) onAdded?.(updateAgent);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la modification de l'agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Edit2 className="w-4 h-4" /> Modifier
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full rounded-lg p-6 bg-white text-gray-900 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Modifier cet agent de livraison
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-sm text-gray-600">
            Remplissez les informations ci-dessous pour modifier cet agent.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-4 flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jean Dupont"
              defaultValue={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@mail.com"
              defaultValue={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="812345678"
              defaultValue={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              minLength={9}
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              type="text"
              placeholder="14, isiro, gombe, kinshasa, rdc"
              defaultValue={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>

          <AlertDialogFooter className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={!canSubmit || loading}
              className="flex items-center gap-2"
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
                "Modifier"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// DELETE AGENT
export const DeleteThisAgent = ({ agent }: { agent: DeliveryAgent }) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await deleteAgentById(agent.id);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      const deleteAgent = result.data;

      toast.success(result.message);
      //   if (deleteAgent) onAdded?.(deleteAgent);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la suppression de l'agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Etes-vous sur de vouloir supprimer?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Supprimer l{`'`}agent{" "}
            <strong className="capitalize">{agent.name}</strong> sera
            definitive, revenir en arriere ne sera pas possible. Voulez-vous
            continuer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={loading || !agent.id}
            asChild
          >
            <Button variant={"destructive"}>
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-destructive"
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
                "Supprimer"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
