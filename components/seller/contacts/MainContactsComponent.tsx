"use client";
import { Contact, Shop } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import useSelectDefaultShop from "../SelectDefaultShop";
import { useRouter } from "next/navigation";
import {
  getContactsByShopId,
  upsertContacts,
} from "@/actions/preferencesAction";
import BorderWrapper from "@/components/BorderWrapper";
import {
  CiInstagram,
  CiMail,
  CiYoutube,
  CiFacebook,
  CiPhone,
  CiTwitter,
} from "react-icons/ci";
import { FaPinterestP } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShopDefaultSelect } from "../SelectWIthOptionsDefaultShop";

type Props = {
  shops: Shop[];
};

const MainContactsComponent = ({ shops }: Props) => {
  const defaultShopId = useSelectDefaultShop({ shops });
  const [contacts, setContacts] = useState<Contact | null>(null);

  const [email, setEmail] = useState(contacts?.email ?? "");
  const [phone, setPhone] = useState(contacts?.phone ?? "");
  const [facebook, setFacebook] = useState(contacts?.facebook ?? "");
  const [instagram, setInstagram] = useState(contacts?.instagram ?? "");
  const [twitter, setTwitter] = useState(contacts?.twitter ?? "");
  const [youtube, setYoutube] = useState(contacts?.youtube ?? "");
  const [pinterest, setPinterest] = useState(contacts?.pinterest ?? "");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const shop = useMemo(
    () => shops.find((i) => i.id === defaultShopId),
    [shops, defaultShopId]
  );

  useEffect(() => {
    const getPrefs = async (shopId: string | undefined) => {
      if (!shopId) return;
      setLoading(true);
      try {
        const data = await getContactsByShopId(shopId);
        setContacts(data.data ? data.data : null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getPrefs(shop?.id);
  }, [shop?.id]);

  //   refetch the current contacts

  useEffect(() => {
    if (contacts) {
      setEmail(contacts.email ?? "");
      setPhone(contacts.phone ?? "");
      setFacebook(contacts.facebook ?? "");
      setInstagram(contacts.instagram ?? "");
      setTwitter(contacts.twitter ?? "");
      setYoutube(contacts.youtube ?? "");
      setPinterest(contacts.pinterest ?? "");
    }
    // console.log("infinie...");
  }, [contacts]);

  if (!shop) {
    return (
      <div className="text-center mx-auto pt-20 text-gray-600 w-full">
        <p className="text-xl lg:text-2xl font-bold">{`cette boutique n'existe pas`}</p>
        <p>Ou une erreur est survenue, reéssayez plus</p>
      </div>
    );
  }

  const handleSaveContacts = async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const ContactsForm = {
        shopId: shop.id,
        email,
        phone,
        facebook,
        instagram,
        twitter,
        youtube,
        pinterest,
      };
      const createUpdateContacts = await upsertContacts(ContactsForm);

      if (createUpdateContacts.error) {
        toast.error("Erreur!", {
          description: createUpdateContacts.message,
        });
        return;
      }
      toast.success("Succès!", {
        description: "Les contacts ont été mis à jour avec succès",
      });

      if (createUpdateContacts.data) setContacts(createUpdateContacts.data);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur!", {
        description: "Erreur lors de la mise à jour des contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out">
      {/* top pres */}
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
        transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out space-y-2">
          <h2 className="text-2xl font-bold lg:text-4xl">
            Les contacts de votre boutique
          </h2>
          <p className="text-gray-600 lg:text-[17px] lg:max-w-xl">
            {`Les contacts de votre boutique seront publique, si vous voulez supprimer un laissez le champ vide.`}
          </p>
          <br />
          <ShopDefaultSelect shops={shops} />
        </div>
        {/* navigate */}

        {/* <LinkAddNewProduct shops={shops} /> */}
      </div>

      {/* form */}
      <BorderWrapper>
        <div className="w-full flex flex-col gap-4">
          {/* email */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <CiMail className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Email de votre boutique ou le votre..."
              type="email"
              required
              minLength={3}
              maxLength={40}
            />
          </div>

          {/* phone */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <CiPhone className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              placeholder="telephone de votre boutique ex:985569966"
              type="tel"
              required
              minLength={9}
              maxLength={10}
            />
          </div>

          {/* facebook */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <CiFacebook className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={loading}
              placeholder="Facebook de votre boutique"
              type="text"
              required
              minLength={3}
              maxLength={40}
            />
          </div>

          {/* instagram */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <CiInstagram className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={loading}
              placeholder="Instagram de votre boutique ou le votre..."
              type="text"
              required
              minLength={3}
              maxLength={40}
            />
          </div>

          {/* Youtube */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <CiYoutube className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              disabled={loading}
              placeholder="Youtube de votre boutique ou le votre..."
              type="text"
              required
              minLength={3}
              maxLength={40}
            />
          </div>
          {/* Twitter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <CiTwitter className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              disabled={loading}
              placeholder="Twitter(X) de votre boutique ou le votre..."
              type="text"
              required
              minLength={3}
              maxLength={40}
            />
          </div>

          {/* Pinterest */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            className="flex flex-row h-12 px-2 gap-2 border rounded border-gray-300 item-center"
          >
            <FaPinterestP className="flex-shrink-0 w-8 text-center" size={25} />
            <input
              className="outline-none border-none focus:outline-none px-1 text-sm font-medium
            ring-0 flex-1 h-full flex-shrink-0 focus:border-none border-transparent
            "
              value={pinterest}
              onChange={(e) => setPinterest(e.target.value)}
              disabled={loading}
              placeholder="Pinterest de votre boutique ou le votre..."
              type="text"
              required
              minLength={3}
              maxLength={40}
            />
          </div>

          {/* submit */}
          <div className="w-full flex py-2">
            <Button
              className="w-full"
              disabled={
                loading ||
                (email === contacts?.email &&
                  facebook === contacts?.facebook &&
                  youtube === contacts?.youtube &&
                  twitter === contacts?.twitter &&
                  pinterest === contacts?.pinterest &&
                  phone === contacts?.phone &&
                  instagram === contacts?.instagram)
              }
              onClick={handleSaveContacts}
            >
              {loading ? "En cours..." : "Modifier les contacts"}
            </Button>
          </div>
        </div>
      </BorderWrapper>
    </div>
  );
};

export default MainContactsComponent;
