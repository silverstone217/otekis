"use client";
import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import { changeCurrencies } from "@/actions/companyAction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HandCoins, Landmark, Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { isEmptyString, returnFormatedMoney } from "@/utils/functions";
import { OtekisPreferences } from "@/lib/generated/prisma/client";
import { PaymentOrderMethods } from "@/utils/paymentData";

const CURRENCIES = ["USD", "CDF"];

type Props = {
  companyPrefs: OtekisPreferences | null;
};

export type CurrencyType = "USD" | "CDF";

// change currencies
export const ChangeCurenncyComponent = ({ companyPrefs }: Props) => {
  const [productCurrency, setProductCurrency] = useState(
    companyPrefs?.currency || "USD"
  );
  // const [transfertCurrency, setTransfertCurrency] = useState(
  //   companyPrefs?.transfertCurrency || "USD"
  // );

  const [exchangeRate, setExchangeRate] = useState(
    companyPrefs?.exchangeRate.toString() || ""
  );
  const [cinetPayPercentage, setCinetPayPercentage] = useState(
    companyPrefs?.cinetPayPercentage || ""
  );
  const [delayRefund, setDelayRefund] = useState(
    companyPrefs?.delayRefund.toString() || ""
  );
  const [delayTransferableMoney, setDelayTransferableMoney] = useState(
    companyPrefs?.delayTransferableMoney.toString() || ""
  );

  const [paymentMethod, setPaymentMethod] = useState(
    companyPrefs?.paymentMethod || "cinetpay"
  );

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isButtonDisabled = useMemo(() => {
    if (loading) return true;
    if (!companyPrefs?.id) return true;
    if (
      productCurrency === companyPrefs.currency &&
      exchangeRate === companyPrefs.exchangeRate.toString() &&
      cinetPayPercentage === companyPrefs.cinetPayPercentage &&
      Number(delayRefund) === companyPrefs.delayRefund &&
      Number(delayTransferableMoney) === companyPrefs.delayTransferableMoney &&
      paymentMethod === companyPrefs.paymentMethod
    )
      return true;

    if (
      isEmptyString(exchangeRate) ||
      isEmptyString(cinetPayPercentage) ||
      isEmptyString(productCurrency) ||
      isEmptyString(delayRefund) ||
      isEmptyString(delayTransferableMoney) ||
      isEmptyString(paymentMethod)
    )
      return true;
    return false;
  }, [
    loading,
    productCurrency,
    exchangeRate,
    companyPrefs,
    cinetPayPercentage,
    delayTransferableMoney,
    delayRefund,
    paymentMethod,
  ]);

  const handleChangeCurrency = async () => {
    if (!companyPrefs) return;
    setLoading(true);

    try {
      const exchangeToNumber = Number(exchangeRate);
      const cinetPayToNumber = Number(cinetPayPercentage);
      const delayTransferableMoneyToNumber = Number(delayTransferableMoney);
      const delayRefundToNumber = Number(delayRefund);

      if (
        isNaN(exchangeToNumber) ||
        isNaN(cinetPayToNumber) ||
        isNaN(delayTransferableMoneyToNumber) ||
        isNaN(delayRefundToNumber)
      ) {
        toast.error(
          "Le taux d'echange, le pourcentage, le delai cinetpay et de remboursement de Cinetpay doivent etre des nombres!"
        );
        return;
      }

      const formData = {
        productCurrency: productCurrency as CurrencyType,
        exchangeRate: exchangeToNumber,
        prefId: companyPrefs.id,
        cinetPayPercentage: cinetPayToNumber,
        delayRefund: delayRefundToNumber,
        delayTransferableMoney: delayTransferableMoneyToNumber,
        paymentMethod,
      };

      const result = await changeCurrencies(formData);
      if (result.error) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre a jour les préférences");
    } finally {
      setLoading(false);
    }
  };

  if (!companyPrefs) {
    return null;
  }

  return (
    <Card className="w-full shadow rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Devises
        </CardTitle>
        <CardDescription className="text-gray-500">
          Changer la devise de produits ou de transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* productCurrency */}
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="productCurrency">Devises des produits</Label>
          <SelectCurrencyOption
            select={productCurrency}
            setSelect={setProductCurrency}
            placehoder="Devise sur les produits"
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="transfertCurrency">
            {`Taux d'echange du dollars en franc`}
          </Label>
          <Input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            min={1}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="transfertCurrency">
            {`Pourcentage de transaction Cinetpay`}
          </Label>
          <Input
            type="number"
            value={cinetPayPercentage}
            onChange={(e) => setCinetPayPercentage(e.target.value)}
            min={0}
            step={0.5}
          />
        </div>

        {/* delay refund */}
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="transfertCurrency">
            {`Delai d'attente pour remboursement`}
          </Label>
          <Input
            type="number"
            value={delayRefund}
            onChange={(e) => setDelayRefund(e.target.value)}
            min={0}
            max={7}
          />
        </div>

        {/* delay tranferable money */}
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="transfertCurrency">
            {`Delai d'attente d'argent sur CinetPay`}
          </Label>
          <Input
            type="number"
            value={delayTransferableMoney}
            onChange={(e) => setDelayTransferableMoney(e.target.value)}
            min={0}
            max={7}
          />
        </div>

        {/* PaymentOrderMethods */}

        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="transfertCurrency">
            {`Méthode de paiement par défaut `} {paymentMethod}
          </Label>
          <div>
            {PaymentOrderMethods.map((method) => {
              return (
                <div key={method.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={method.value}
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() =>
                      setPaymentMethod(
                        method.value as "cinetpay" | "cash" | "mpesa" | "bank"
                      )
                    }
                  />
                  <label htmlFor={method.value}>{method.label}</label>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex items-center justify-start gap-4 flex-wrap">
        <Button disabled={isButtonDisabled} onClick={handleChangeCurrency}>
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              en cours
            </>
          ) : (
            <span> Appliquer</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

type SelectCurrencyOptionType = {
  select: string;
  setSelect: React.Dispatch<React.SetStateAction<string>>;
  placehoder: string;
};
const SelectCurrencyOption = ({
  select,
  setSelect,
  placehoder,
}: SelectCurrencyOptionType) => {
  return (
    <Select value={select} onValueChange={(val) => setSelect(val)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placehoder} />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// infos soldes
interface CardInfosSoldesProps {
  totalShops: number;
  amountToPay: number;
  totalBalance: number;
  currencySymbol?: string; // '$' ou d'autres symboles
}

export const CardInfosSoldes = ({
  totalShops = 20, // Valeurs par défaut
  amountToPay = 465.0,
  totalBalance = 1465.0,
  currencySymbol = "$",
}: CardInfosSoldesProps) => {
  return (
    <Card className="w-full  shadow rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {`Vue d'ensemble financière`}
        </CardTitle>
        <CardDescription className="text-gray-500">
          Suivi de vos principaux indicateurs financiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-1">
        {/* Card pour les boutiques */}
        <Card
          className="flex items-center p-4 border border-gray-200 rounded-md 
        shadow-sm w-full"
        >
          <Store className="text-blue-600 size-6 mr-3 flex-shrink-0" />
          <div className="flex-grow flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500">
              Boutiques à payer
            </p>
            <p className="text-xl font-bold text-gray-900 text-center">
              {totalShops}
            </p>
          </div>
        </Card>

        {/* Card pour le total à payer */}
        <Card
          className="flex items-center p-4 border border-gray-200 
        rounded-md shadow-sm w-full"
        >
          <HandCoins className="text-red-600 size-6 mr-3 flex-shrink-0" />
          <div className="flex-grow flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500">Montant dû</p>
            <p className="text-xl font-bold text-gray-900 text-center">
              {returnFormatedMoney(amountToPay)}{" "}
              <span className="font-mono text-sm text-gray-600">
                {currencySymbol}
              </span>
            </p>
          </div>
        </Card>

        {/* Card pour le solde total */}
        <Card
          className="flex items-center p-4 border border-gray-200 
        rounded-md shadow-sm w-full"
        >
          <Landmark className="text-green-600 size-6 mr-3 flex-shrink-0 " />
          <div className="flex-grow flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500">
              Solde disponible
            </p>
            <p className="text-xl font-bold text-gray-900 text-center">
              {returnFormatedMoney(totalBalance)}{" "}
              <span className="font-mono text-sm text-gray-600">
                {currencySymbol}
              </span>
            </p>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};
