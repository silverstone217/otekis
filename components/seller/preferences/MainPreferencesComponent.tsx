"use client";
import { Preferences, Shop } from "@prisma/client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import useSelectDefaultShop from "../SelectDefaultShop";
import {
  backgroundColors,
  bckColorsData,
  buttonColors,
  ButtonColorsData,
  ButtonRadiusData,
  buttonRadiusData,
  CartIcons,
  CategoryTemplateData,
  HeaderPositions,
  HeaderTemplateData,
  // HeroSectionData,
  HeroTemplateData,
  MenuIcons,
  returnButtonradiusText,
  textColorData,
} from "@/utils/preferences";
import {
  addNewPrefs,
  getPrefrenceByShopId,
  updatePrefs,
} from "@/actions/preferencesAction";
import BorderWrapper from "@/components/BorderWrapper";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isEmptyString } from "@/utils/functions";
import Link from "next/link";
import { Store } from "lucide-react";
import { fontOptions } from "@/utils/shopData";
import { toast } from "sonner";
import { FontsList } from "@/utils/fontsData";
import { ShopDefaultSelect } from "../SelectWIthOptionsDefaultShop";
import { Switch } from "@/components/ui/switch";

type Props = {
  shops: Shop[];
};

const MainPreferencesComponent = ({ shops }: Props) => {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const defaultShopId = useSelectDefaultShop({ shops });

  const [background, setBackground] = useState(
    preferences?.background ?? backgroundColors.white
  );
  const [textColor, setTextColor] = useState(
    preferences?.textColor ?? background === backgroundColors.white
      ? textColorData.light
      : textColorData.dark
  );
  const [buttonColor, setButtonColor] = useState(
    preferences?.buttonColor ?? buttonColors.black
  );
  const [buttonRadius, setButtonRadius] = useState(
    preferences?.buttonRadius ?? buttonRadiusData.small
  );
  const [buttonTextColor, setButtonTextColor] = useState(
    preferences?.textColor ?? buttonColor === buttonColors.white
      ? textColorData.light
      : textColorData.dark
  );

  const [fontFamily, setFontFamily] = useState(
    preferences?.fontFamily ?? "Lato"
  );

  const [logoTop, setLogoTop] = useState(preferences?.logo ?? "name");
  const [menuIcon, setMenuIcon] = useState(preferences?.menuIcon ?? "0");
  const [cartIcon, setCartIcon] = useState(preferences?.cartIcon ?? "0");

  // Added
  const [Header, setHeader] = useState(preferences?.Header ?? "0");
  const [Hero, setHero] = useState(preferences?.Hero ?? "0");
  const [Category, setCategory] = useState(preferences?.Category ?? "0");

  const [heroSection, setHeroSection] = useState(preferences?.hero ?? "random");
  //   const [displayHero, setDisplayHero] = useState(true);
  const [title, setTitle] = useState("Bienvenue dans Ma boutique");
  const [description, setDescription] = useState(
    "Parcourez le catalogue et trouvez ce qui vous fait envie!"
  );
  const [textPosition, setTextPosition] = useState(
    preferences?.positionText ?? "center"
  );
  const [showDescription, setShowDescription] = useState(
    preferences?.showDescription ?? true
  );

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const shop = useMemo(
    () => shops.find((i) => i.id === defaultShopId),
    [shops, defaultShopId]
  );

  // font update
  const getMyFont = FontsList.find(
    (font) => font.name === fontFamily
  )?.component;

  useEffect(() => {
    const getPrefs = async (shopId: string | undefined) => {
      if (!shopId) return;
      setLoading(true);
      try {
        const data = await getPrefrenceByShopId(shopId);
        setPreferences(data ? data : null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getPrefs(shop?.id);
  }, [shop?.id]);

  // refetch
  useEffect(() => {
    if (preferences) {
      setBackground(preferences.background ?? backgroundColors.white);
      setButtonColor(preferences.buttonColor ?? buttonColors.black);
      setButtonRadius(preferences.buttonRadius ?? buttonRadiusData.small);
      setHeroSection(preferences.hero ?? "random");
      setTitle(preferences.title ?? "Bienvenue dans Ma boutique");
      setDescription(
        preferences.description ??
          "Parcourez le catalogue et trouvez ce qui vous fait envie!"
      );
      setButtonTextColor(
        preferences.buttonTextColor ?? buttonColor === buttonColors.white
          ? textColorData.light
          : textColorData.dark
      );
      setTextColor(
        preferences.textColor ?? background === backgroundColors.white
          ? textColorData.light
          : textColorData.dark
      );
      setFontFamily(preferences.fontFamily ?? "Lato");
      setLogoTop(preferences.logo ?? "name");
      setMenuIcon(preferences.menuIcon ?? "0");
      setCartIcon(preferences.cartIcon ?? "0");
      // added
      setHeader(preferences.Header ?? "0");
      setHero(preferences.Hero ?? "0");
      setTextPosition(preferences.positionText ?? "center");
      setCategory(preferences.Category ?? "0");
    }
    // console.log("infinie...");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  const textColorFilter = useMemo(() => {
    return background === backgroundColors.white
      ? textColorData.light
      : textColorData.dark;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background, textColor]);

  const buttonTextColorFilter = useMemo(
    () =>
      buttonColor === buttonColors.white
        ? textColorData.light
        : textColorData.dark,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buttonColor, buttonTextColor]
  );

  // DISABLED BTN
  const isButtonDisabled = useMemo(() => {
    return (
      loading ||
      (buttonColor === preferences?.buttonColor &&
        background === preferences?.background &&
        buttonRadius === preferences?.buttonRadius &&
        heroSection === preferences?.hero &&
        fontFamily === preferences?.fontFamily &&
        logoTop === preferences?.logo &&
        menuIcon === preferences?.menuIcon &&
        cartIcon === preferences?.cartIcon &&
        title === preferences?.title &&
        description === preferences?.description &&
        Header === preferences?.Header &&
        Hero === preferences.Hero &&
        textPosition === preferences.positionText &&
        Category === preferences.Category &&
        showDescription === preferences.showDescription)
    );
  }, [
    loading,
    buttonColor,
    background,
    buttonRadius,
    heroSection,
    fontFamily,
    logoTop,
    menuIcon,
    cartIcon,
    title,
    description,
    Header,
    Hero,
    textPosition,
    preferences,
    Category,
    showDescription,
  ]);

  if (!shop) {
    return (
      <div className="text-center mx-auto pt-20 text-gray-600 w-full">
        <p className="text-xl lg:text-2xl font-bold">{`cette boutique n'existe pas`}</p>
        <p>Ou une erreur est survenue, reéssayez plus</p>
      </div>
    );
  }
  // console.log("prefs", { background, buttonColor });

  // create prefs
  const handleAddNewPrefs = async () => {
    if (!shop) return;
    // check color
    if (background === buttonColor) {
      toast.error("Erreur!", {
        description:
          "La couleur de fond doit etre differente de celle du bouton",
      });
      return;
    }
    // check hero and cover type
    if (
      heroSection === "cover" &&
      (isEmptyString(title) || isEmptyString(description))
    ) {
      toast.error("Erreur!", {
        description:
          "Veuillez renseigner le titre et la description pour la couverture de presentation",
      });
      return;
    }
    setLoading(true);
    try {
      const newPreferences = {
        shopId: shop.id,
        background,
        buttonColor,
        buttonRadius,
        hero: heroSection,
        title,
        description,
        textColor: textColorFilter,
        buttonTextColor: buttonTextColorFilter,
        fontFamily,
        logo: logoTop,
        menuIcon,
        cartIcon,
        Header,
        Hero,
        positionText: textPosition,
        Category,
        showDescription,
      };
      const prefs = await addNewPrefs(newPreferences);
      if (prefs.error) {
        toast.error("Erreur survenue", {
          description: prefs.message,
        });
        return;
      }
      toast.success(prefs.message);

      if (prefs.data) setPreferences(prefs.data);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "Une erreur s'est produite lors de l'enregistrement des préférences, veuillez réessayer plus tard!"
      );
    } finally {
      setLoading(false);
    }
  };
  // update prefs
  const handleUpdatePrefs = async () => {
    if (!shop) return;
    // check color
    if (background === buttonColor) {
      toast.error("Erreur!", {
        description:
          "La couleur de fond doit etre differente de celle du bouton",
      });
      return;
    }
    // check hero and cover type
    if (
      heroSection === "cover" &&
      (isEmptyString(title) || isEmptyString(description))
    ) {
      toast.error("Erreur!", {
        description:
          "Veuillez renseigner le titre et la description pour la couverture de presentation",
      });
      return;
    }
    setLoading(true);
    try {
      const newPreferences = {
        shopId: shop.id,
        background,
        buttonColor,
        buttonRadius,
        hero: heroSection,
        title,
        description,
        textColor: textColorFilter,
        buttonTextColor: buttonTextColorFilter,
        fontFamily,
        logo: logoTop,
        menuIcon,
        cartIcon,
        Header,
        Hero,
        positionText: textPosition,
        Category,
        showDescription,
      };
      const prefs = await updatePrefs(newPreferences);
      if (prefs.error) {
        toast.error("Erreur survenue", {
          description: prefs.message,
        });
        return;
      }
      toast.success("Succès", {
        description: prefs.message,
      });

      if (prefs.data) setPreferences(prefs.data);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        "Une erreur s'est produite lors de la modification des préférences, veuillez réessayer plus tard!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full flex flex-col gap-10 transition-all 
    duration-500 ease-in-out"
    >
      <div
        className="w-full flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between 
  transition-all duration-500 ease-in-out"
      >
        <div className="transition-all duration-500 ease-in-out space-y-2">
          <h2 className="text-2xl font-bold lg:text-4xl">
            Les preferences pour votre boutique
          </h2>
          <p className="text-gray-600 lg:text-[17px] lg:max-w-xl">
            {`Designer, changer l'interface de votre boutique comme cela se presentera à vos clients.`}
          </p>
          <br />
          <ShopDefaultSelect shops={shops} />
        </div>
        {/* navigate */}

        <Link
          href={`/${shop.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full lg:w-fit lg:px-6 py-3 bg-primary text-center text-white font-medium border-2 border-primary 
        hover:bg-transparent hover:text-black transition-all duration-500 ease-in-out shadow-md
        flex items-center justify-center gap-4
        "
        >
          <span>Voire ma boutique</span>
          <Store className="flex-shrink-0 w-8" />
        </Link>
      </div>

      {/* Shops */}
      {/* <AdminsDataTable data={admins} columns={AdminsColumns} /> */}
      <Suspense fallback={<div>loading...</div>}>
        <div className="grid grid-cols-1 gap-6">
          {/* header */}
          <BorderWrapper>
            <div className="w-full gap-2.5 flex flex-col transition-all duration-500 ease-in-out">
              <Label className="font-bold py-2">Partie Header logo</Label>

              {/* radio */}
              <RadioGroup
                value={logoTop}
                onValueChange={(val) => setLogoTop(val)}
              >
                <div className="flex gap-5 flex-wrap item-center justify-start w-full transition-all duration-500 ease-in-out">
                  <div className="flex item-center gap-2">
                    <RadioGroupItem value={"name"} id={"logo-name"} />
                    <Label htmlFor={"logo-name"}>{"Nom de la boutique"}</Label>
                  </div>

                  <div className="flex item-center gap-2">
                    <RadioGroupItem value={"logo"} id={"logo-image"} />
                    <Label htmlFor={"logo-image"}>
                      {"image de la boutique"}
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </BorderWrapper>

          {/* Menu Icon */}
          <BorderWrapper>
            <div className="w-full gap-2.5 flex flex-col transition-all duration-500 ease-in-out">
              <Label className="font-bold py-2">Icon du menu(smartphone)</Label>

              {/* radio */}
              <RadioGroup
                value={menuIcon}
                onValueChange={(val) => setMenuIcon(val)}
              >
                <div
                  className="flex gap-5 flex-wrap item-center 
                justify-start w-full transition-all duration-500 ease-in-out"
                >
                  {MenuIcons.map((Mi, idx) => (
                    <div key={idx} className="flex item-center gap-2">
                      <RadioGroupItem
                        value={idx.toString()}
                        id={idx.toString()}
                      />
                      <Mi />
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </BorderWrapper>

          {/* Cart icons */}
          <BorderWrapper>
            <div className="w-full gap-2.5 flex flex-col transition-all duration-500 ease-in-out">
              <Label className="font-bold py-2">Icon du Panier</Label>

              {/* radio */}
              <RadioGroup
                value={cartIcon}
                onValueChange={(val) => setCartIcon(val)}
              >
                <div className="flex gap-5 flex-wrap item-center justify-start w-full transition-all duration-500 ease-in-out">
                  {CartIcons.map((Mi, idx) => (
                    <div key={idx} className="flex item-center gap-2">
                      <RadioGroupItem
                        value={idx.toString()}
                        id={idx.toString()}
                      />
                      <Mi className="flex-shrink-0 size-6" />
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </BorderWrapper>

          {/* TYPE DE HEADER SECTION */}
          <BorderWrapper>
            <div
              className="w-full gap-2.5 flex flex-col transition-all 
            duration-500 ease-in-out"
            >
              <Label className="font-bold py-2">
                Design du Menu de navigation (en tete)
              </Label>

              {/* radio */}
              <RadioGroup
                value={Header}
                onValueChange={(val) => setHeader(val)}
              >
                <div
                  className="flex gap-5 flex-wrap item-center justify-start 
                w-full transition-all duration-500 ease-in-out"
                >
                  {HeaderTemplateData.map((ff, idx) => (
                    <div key={idx} className="flex item-center gap-2">
                      <RadioGroupItem value={ff.value} id={ff.label} />
                      <Label htmlFor={ff.label}>{ff.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </BorderWrapper>

          {/*DESIGN HERO section shop */}
          <BorderWrapper>
            <div
              className="w-full gap-2.5 flex flex-col transition-all 
            duration-500 ease-in-out"
            >
              <Label className="font-bold py-2">
                Partie superieure de presentation (DESIGN)
              </Label>
              {/* radio */}
              <RadioGroup value={Hero} onValueChange={(val) => setHero(val)}>
                <div
                  className="flex gap-5 flex-wrap item-center 
                justify-start w-full transition-all duration-500 ease-in-out"
                >
                  {HeroTemplateData.map((hr, idx) => (
                    <div key={idx} className="flex item-center gap-2">
                      <RadioGroupItem value={hr.value} id={hr.label} />
                      <Label htmlFor={hr.label}>{hr.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <div className="my-0.5" />
              {/* text with cover */}
              {Hero === "0" && (
                <BorderWrapper>
                  <div className="flex flex-col gap-4 w-full">
                    {/* if cover not exist */}
                    {!shop.cover && (
                      <p className="text-gray-600 text-sm">
                        {` L'image de couverture n'a pas encore etait definie, publier la dans la section`}
                        <strong> Ma Boutique </strong> pour utiliser cette
                        option.
                      </p>
                    )}
                    {/* TEXT Position */}
                    {/* input text */}
                    <BorderWrapper>
                      <div className="w-full space-y-1.5">
                        <Label>Affichage des textes</Label>
                        <RadioGroup
                          value={textPosition}
                          onValueChange={(val) => setTextPosition(val)}
                        >
                          {[
                            { label: "Au centre", value: "center" },
                            { label: "Ne pas afficher", value: "hidden" },
                          ].map((hr, idx) => (
                            <div key={idx} className="flex item-center gap-2">
                              <RadioGroupItem value={hr.value} id={hr.label} />
                              <Label htmlFor={hr.label}>{hr.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </BorderWrapper>

                    {/* input text */}
                    <BorderWrapper>
                      <div className="w-full space-y-1.5">
                        <Label>Titre de presentation</Label>
                        <Input
                          type="text"
                          placeholder="Entrez votre titre de couverture"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={loading}
                          className="w-full"
                          maxLength={100}
                        />
                      </div>
                    </BorderWrapper>

                    {/* input text */}
                    <BorderWrapper>
                      <div className="w-full space-y-1.5">
                        <Label>Message de presentation</Label>
                        <Textarea
                          placeholder="Entrez votre message de couverture"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={loading}
                          className="w-full max-h-36"
                          maxLength={500}
                        />
                      </div>
                    </BorderWrapper>
                  </div>
                </BorderWrapper>
              )}
            </div>
          </BorderWrapper>

          {/* Category Shop */}
          <BorderWrapper>
            <div
              className="w-full gap-2.5 flex flex-col transition-all duration-500 
            ease-in-out"
            >
              <Label className="font-bold py-2">Section de Categorie</Label>

              {/* radio category */}
              <RadioGroup
                value={Category}
                onValueChange={(val) => setCategory(val)}
              >
                <div
                  className="flex gap-5 flex-wrap item-center justify-start 
                w-full transition-all duration-500 ease-in-out"
                >
                  {CategoryTemplateData.map((hr, idx) => (
                    <div key={idx} className="flex item-center gap-2">
                      <RadioGroupItem value={hr.value} id={hr.label} />
                      <Label htmlFor={hr.label}>{hr.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </BorderWrapper>

          {/* DESCRIPTION SHOW */}
          <BorderWrapper>
            <div className="w-full space-y-1.5">
              <Label>Afficher la description</Label>
              <Switch
                checked={showDescription}
                onCheckedChange={setShowDescription}
              />
            </div>
          </BorderWrapper>

          {/* Fonts family */}
          <BorderWrapper>
            <div
              className="w-full gap-2.5 flex flex-col transition-all 
            duration-500 ease-in-out"
            >
              <Label className="font-bold py-2">{`Polices d'écriture`}</Label>
              {/* radio */}
              <RadioGroup
                value={fontFamily}
                onValueChange={(val) => setFontFamily(val)}
              >
                <div
                  className="flex gap-5 flex-wrap item-center justify-start 
                w-full transition-all duration-500 ease-in-out"
                >
                  {fontOptions.map((ff, idx) => {
                    const font =
                      FontsList.find((f) => f.name === ff.value) ??
                      FontsList[0];

                    return (
                      <div key={idx} className="flex item-center gap-2">
                        <RadioGroupItem value={ff.value} id={ff.label} />
                        <Label
                          htmlFor={ff.label}
                          className={`${font.component.className}`}
                        >
                          {ff.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>
          </BorderWrapper>

          {/* Background */}
          <BorderWrapper>
            <div
              className="w-full gap-2.5 flex flex-col transition-all 
            duration-500 ease-in-out"
            >
              <Label className="font-bold py-2">Couleur de fond</Label>
              <div
                className="flex gap-4 flex-wrap item-center justify-start 
              w-full transition-all duration-500 ease-in-out"
              >
                {bckColorsData.map((clr, idx) => (
                  <span
                    role="button"
                    onClick={() => setBackground(clr.value)}
                    key={idx}
                    style={{
                      backgroundColor: clr.value,
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: `3px solid ${
                        background === clr.value
                          ? "dimgray"
                          : clr.value === backgroundColors.white
                          ? "gainsboro"
                          : "transparent"
                      }`,
                    }}
                    className="transition-all duration-500 ease-in-out 
                    hover:scale-110
                  "
                  />
                ))}
              </div>
            </div>
          </BorderWrapper>

          {/* buttons */}

          <BorderWrapper>
            <div
              className="w-full gap-4 flex flex-col transition-all 
            duration-500 ease-in-out"
            >
              <Label className="font-bold py-2">Bouton</Label>
              {/* color btn */}
              <BorderWrapper>
                <div
                  className="w-full gap-2.5 flex flex-col transition-all 
                duration-500 ease-in-out"
                >
                  <Label>Couleur de button</Label>
                  <div className="flex gap-4 flex-wrap item-center justify-start w-full transition-all duration-500 ease-in-out">
                    {ButtonColorsData.map((clr, idx) => (
                      <span
                        role="button"
                        onClick={() => setButtonColor(clr.value)}
                        key={idx}
                        style={{
                          backgroundColor: clr.value,
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: `3px solid ${
                            buttonColor === clr.value
                              ? "dimgray"
                              : clr.value === buttonColors.white
                              ? "gainsboro"
                              : "transparent"
                          }`,
                        }}
                        className="transition-all duration-500 ease-in-out 
                        hover:scale-110
                  "
                      />
                    ))}
                  </div>
                </div>
              </BorderWrapper>
              {/* radius btn */}
              <BorderWrapper>
                <div className="w-full gap-2.5 flex flex-col transition-all duration-500 ease-in-out">
                  <Label>Forme arrondie du bouton</Label>
                  <div className="flex gap-4 flex-wrap item-center justify-start w-full transition-all duration-500 ease-in-out">
                    {ButtonRadiusData.map((clr, idx) => (
                      <span
                        role="button"
                        onClick={() => setButtonRadius(clr.value)}
                        key={idx}
                        style={{
                          borderRadius: clr.value,
                          border: `2px solid ${
                            buttonRadius === clr.value
                              ? buttonColor
                              : "gainsboro"
                          }`,
                        }}
                        className="transition-all duration-500 ease-in-out hover:scale-110 py-2 px-4
                  "
                      >
                        {returnButtonradiusText(clr.label)}
                      </span>
                    ))}
                  </div>
                </div>
              </BorderWrapper>

              {/* final button */}
              <div
                style={{
                  backgroundColor: background,
                  color: textColorFilter,
                }}
                className={`w-full gap-4 flex flex-col transition-all duration-500 ease-in-out p-4
                  ${getMyFont?.className}
                  `}
              >
                <Label className="text-xl">Resultat final</Label>
                <span
                  className="px-4 py-2 flex item-center justify-between w-full text-center font-medium
                  transition-all duration-500 ease-in-out pointer-events-none shadow
                  "
                  style={{
                    backgroundColor: buttonColor,
                    color: buttonTextColorFilter,
                    borderRadius: buttonRadius,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Bouton
                </span>
              </div>
            </div>
          </BorderWrapper>

          {/* buttons */}
          {!preferences && (
            <div className="w-full gap-4 flex flex-col transition-all duration-500 ease-in-out">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={handleAddNewPrefs}
              >
                {loading ? "En cours..." : "Ajouter"}
              </Button>
            </div>
          )}

          {preferences && (
            <div className="w-full gap-4 flex flex-col transition-all duration-500 ease-in-out">
              <Button
                type="submit"
                className="w-full"
                disabled={isButtonDisabled}
                onClick={handleUpdatePrefs}
              >
                {loading ? "En cours..." : "Sauvegarder"}
              </Button>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default MainPreferencesComponent;
