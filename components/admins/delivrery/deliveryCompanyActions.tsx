"use client";

import { useMemo, useState } from "react";
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
import { Trash2, Truck } from "lucide-react";
import { deleteAgentById } from "@/actions/deliverymenActions";
import { DeliveryCompany } from "@prisma/client";
import {
  addNewCompany,
  deleteCompanyById,
  modifyACompanyByID,
  modifyCompanyType,
  newCompanyType,
} from "@/actions/deliveryCompaniesAction";
import { Switch } from "@/components/ui/switch";

export type DeliveryComStats = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
};

export function AddDeliveryCompany() {
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
    (formData.email.trim() === "" ||
      (formData.email && isValidEmail(formData.email))) &&
    formData.phone.trim().length >= 6 &&
    formData.address.trim().length > 3;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Veuillez remplir correctement tous les champs requis.");
      return;
    }

    setLoading(true);
    try {
      const newformData: newCompanyType = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      const result = await addNewCompany(newformData);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      const newCompany = result.data;

      toast.success(`Agent ${newCompany?.name} ajouté avec succès !`);
      setOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "" });
      //   if (newCompany) onAdded?.(newCompany);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de l'ajout de la companie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Ajouter une companie
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full rounded-lg p-6 bg-white text-gray-900 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Ajouter une nouvelle companie de livraison
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-sm text-gray-600">
            Remplissez les informations ci-dessous pour ajouter une nouvelle
            companie.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-4 flex flex-col gap-4"
        >
          {/* name */}
          <div>
            <Label htmlFor="name">Nom de la companie *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Express kin"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={60}
            />
          </div>

          {/* phone */}
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

          {/* email */}
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

          {/* address */}
          <div>
            <Label htmlFor="address">Adresse </Label>
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

// MODIFY company
type ModifyCompProps = {
  company: DeliveryCompany;
};

export function ModifyDeliveryCompany({ company }: ModifyCompProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address: company.address ?? "",
    isAvailable: company.isAvailable ?? true,
  });

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  //   verify email
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isEmailAndValid = useMemo(() => {
    if (formData.email) {
      return isValidEmail(formData.email);
    }
    return true;
  }, [formData.email]);

  //   check if the values have changed
  const isTheSameValueAsBefore = useMemo(() => {
    if (
      formData.name === company.name &&
      formData.email === company.email &&
      formData.phone === company.phone &&
      formData.address === company.address &&
      formData.isAvailable === company.isAvailable
    )
      return false;
    return true;
  }, [formData, company]);

  //   enable or disable button based on values
  const canSubmit =
    formData.name.trim().length > 2 &&
    formData.phone.trim().length == 9 &&
    formData.address.trim().length > 3 &&
    isEmailAndValid &&
    isTheSameValueAsBefore;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Veuillez remplir correctement tous les champs requis.");
      return;
    }

    setLoading(true);
    try {
      const newformData: modifyCompanyType = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        id: company.id,
        isAvailable: formData.isAvailable,
      };

      const result = await modifyACompanyByID(newformData);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      const updatedCompany = result.data;

      setOpen(false);
      if (updatedCompany)
        setFormData({
          name: updatedCompany?.name,
          email: updatedCompany?.email ?? "",
          phone: updatedCompany?.phone,
          address: updatedCompany?.address ?? "",
          isAvailable: updatedCompany?.isAvailable ?? true,
        });
      toast.success(`Agent ${updatedCompany?.name} modifié avec succès !`);
      //   if (updatedCompany) onAdded?.(updatedCompany);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la modification de la companie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className="text-sm flex items-center px-2 p-1 hover:bg-secondary/80 transition-all
      ease-in-out duration-300 w-full"
      >
        Modifier
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full rounded-lg p-6 bg-white text-gray-900 shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Modifier cette companie de livraison
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-sm text-gray-600">
            Remplissez les informations ci-dessous pour modifier cette companie.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-4 flex flex-col gap-4"
        >
          {/* name */}
          <div>
            <Label htmlFor="name">Nom de la companie *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Express kin"
              defaultValue={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={60}
            />
          </div>

          {/* phone */}
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

          {/* email */}
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

          {/* address */}
          <div>
            <Label htmlFor="address">Adresse </Label>
            <Input
              id="address"
              type="text"
              placeholder="14, isiro, gombe, kinshasa, rdc"
              defaultValue={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>

          {/* company isAvailable? */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isAvailable">Disponible ou Actif</Label>
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) =>
                handleChange("isAvailable", checked)
              }
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

// DELETE Company
export const DeleteThisCompany = ({
  company,
}: {
  company: DeliveryCompany;
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await deleteCompanyById(company.id);
      if (result.error) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la suppression de la companie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="text-destructive hover:bg-secondary/80 transition-all duration-500 ease-in-out
      text-sm p-2 px-2 w-full flex items-center
      "
      >
        Supprimer
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Etes-vous sur de vouloir supprimer?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Supprimer la companie{" "}
            <strong className="capitalize">{company.name}</strong> sera
            definitive, revenir en arriere ne sera pas possible. Voulez-vous
            continuer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={loading || !company.id}
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
