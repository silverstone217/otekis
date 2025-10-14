import {
  Poppins,
  Merriweather_Sans,
  Nunito_Sans,
  Lato,
  Montserrat,
  Alegreya_SC,
  Quantico,
  Orbitron,
  Turret_Road,
  Atma,
  Hahmlet,
  BioRhyme,
  Gwendolyn,
  Dancing_Script,
} from "next/font/google";

export const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "900", "100", "200", "500"],
  variable: "--font-poppins",
  display: "swap",
});

export const merriweather = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "500"],
  variable: "--font-merriweather",
  display: "swap",
});

export const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "900", "1000", "200", "500"],
  variable: "--font-nunito",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "900", "200", "100", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

export const alegreya = Alegreya_SC({
  subsets: ["latin"],
  weight: ["400", "700", "500", "800", "900"],
  variable: "--font-alegreya",
  display: "swap",
});

export const quantico = Quantico({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quantico",
  display: "swap",
});

export const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900", "500"],
  variable: "--font-orbitron",
  display: "swap",
});

export const turretRoad = Turret_Road({
  subsets: ["latin"],
  weight: ["400", "700", "800", "200", "500"],
  variable: "--font-turret-road",
  display: "swap",
});

export const atma = Atma({
  subsets: ["latin"],
  weight: ["400", "700", "300", "600", "500"],
  variable: "--font-atma",
  display: "swap",
});
export const hahmlet = Hahmlet({
  subsets: ["latin"],
  weight: ["400", "700", "300", "600", "500", "100", "900", "200", "800"],
  variable: "--font-atma",
  display: "swap",
});
export const bioRhyme = BioRhyme({
  subsets: ["latin"],
  weight: ["400", "700", "300", "600", "500", "200", "800"],
  variable: "--font-atma",
  display: "swap",
});

export const gwendolyn = Gwendolyn({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gwendolyn",
  display: "swap",
});
export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700", "500"],
  variable: "--font-dancing-script",
  display: "swap",
});

export const FontsList = [
  { name: "Poppins", component: poppins },
  { name: "Merriweather", component: merriweather },
  { name: "Nunito", component: nunito },
  { name: "Lato", component: lato },
  { name: "Montserrat", component: montserrat },
  { name: "Alegreya SC", component: alegreya },
  { name: "Quantico", component: quantico },
  { name: "Orbitron", component: orbitron },
  { name: "Turret Road", component: turretRoad },
  { name: "Atma", component: atma },
  { name: "Hahmlet", component: hahmlet },
  { name: "BioRhyme", component: bioRhyme },
  { name: "Gwendolyn", component: gwendolyn },
  { name: "Dancing Script", component: dancingScript },
].sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
