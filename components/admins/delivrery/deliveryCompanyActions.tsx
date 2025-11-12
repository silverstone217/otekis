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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type DeliveryComStats = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  paymentMethod: "mobile_money" | "cash";
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
    paymentMethod: "mobile_money",
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
        paymentMethod: formData.paymentMethod as "mobile_money" | "cash",
      };

      const result = await addNewCompany(newformData);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      const newCompany = result.data;

      toast.success(`Service ${newCompany?.name} ajouté avec succès !`);
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        paymentMethod: "mobile_money",
      });
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
          <div className="grid w-full gap-1.5">
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
          <div className="grid w-full gap-1.5">
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
          <div className="grid w-full gap-1.5">
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
          <div className="grid w-full gap-1.5">
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

          {/* PAYMENT METHOD */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="mobile_money">Methode de paiement </Label>
            <RadioGroup
              defaultValue={formData.paymentMethod}
              className="w-full flex gap-4"
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: val as "mobile_money" | "cash",
                }))
              }
            >
              {["mobile_money", "cash"].map((p, idx) => {
                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 capitalize"
                  >
                    <RadioGroupItem value={p} id={p} />
                    <Label htmlFor={p}>{p.replace(/_/g, " ")}</Label>
                  </div>
                );
              })}
            </RadioGroup>
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

  // 🔹 États individuels
  const [name, setName] = useState(company.name ?? "");
  const [email, setEmail] = useState(
    company.email ? (company.email === "N/A" ? "" : company.email) : ""
  );
  const [phone, setPhone] = useState(company.phone ?? "");
  const [address, setAddress] = useState(company.address ?? "");
  const [isAvailable, setIsAvailable] = useState(company.isAvailable ?? true);
  const [paymentMethod, setPaymentMethod] = useState(
    company.paymentMethod ?? "mobile_money"
  );

  // 🔹 Validation email
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isEmailAndValid = useMemo(() => {
    if (email) return isValidEmail(email);
    return true;
  }, [email]);

  // 🔹 Vérifier si les valeurs ont changé
  const hasChanged = useMemo(() => {
    return !(
      name === company.name &&
      email === company.email &&
      phone === company.phone &&
      address === company.address &&
      isAvailable === company.isAvailable &&
      paymentMethod === company.paymentMethod
    );
  }, [
    name,
    email,
    phone,
    address,
    isAvailable,
    paymentMethod,
    company.name,
    company.email,
    company.phone,
    company.address,
    company.isAvailable,
    company.paymentMethod,
  ]);

  // 🔹 Conditions d’activation du bouton
  const canSubmit =
    name.trim().length > 2 &&
    phone.trim().length === 9 &&
    address.trim().length > 3 &&
    // isEmailAndValid &&
    hasChanged;

  // 🔹 Soumission
  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Veuillez remplir correctement tous les champs requis.");
      return;
    }

    setLoading(true);
    try {
      const newformData: modifyCompanyType = {
        id: company.id,
        name,
        email,
        phone,
        address,
        isAvailable,
        paymentMethod: paymentMethod as "mobile_money" | "cash",
      };

      const result = await modifyACompanyByID(newformData);
      if (result.error) {
        toast.error(result.message);
        return;
      }

      const updatedCompany = result.data;
      setOpen(false);

      if (updatedCompany) {
        setName(updatedCompany.name ?? "");
        setEmail(updatedCompany.email ?? "");
        setPhone(updatedCompany.phone ?? "");
        setAddress(updatedCompany.address ?? "");
        setIsAvailable(updatedCompany.isAvailable ?? true);
        setPaymentMethod(updatedCompany.paymentMethod ?? "mobile_money");
      }

      toast.success(`Service ${updatedCompany?.name} modifié avec succès !`);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de la modification de la companie");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UI
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
          <div className="grid w-full gap-1.5">
            <Label htmlFor="name">Nom de la companie *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Express kin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={60}
            />
          </div>

          {/* phone */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="812345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              minLength={9}
              maxLength={9}
            />
          </div>

          {/* email */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={60}
              required={false}
            />
          </div>

          {/* address */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="address">Adresse </Label>
            <Input
              id="address"
              type="text"
              placeholder="14, isiro, gombe, kinshasa, rdc"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* PAYMENT METHOD */}
          <div className="grid w-full gap-1.5">
            <Label htmlFor="mobile_money">Methode de paiement </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) =>
                setPaymentMethod(val as "mobile_money" | "cash")
              }
              className="w-full flex gap-4"
            >
              {["mobile_money", "cash"].map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 capitalize"
                >
                  <RadioGroupItem value={p} id={p} />
                  <Label htmlFor={p}>{p.replace(/_/g, " ")}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* company isAvailable? */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isAvailable">Disponible ou Actif</Label>
            <Switch
              id="isAvailable"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>

          <AlertDialogFooter className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <Button
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
            </Button>
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
