export const capitalizeText = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// return itensity of color

export const luminanceColor = (color: string) => {
  // Calcul de la couleur du texte selon la luminosité pour lisibilité
  const hexToLuminance = (hex: string) => {
    // Remove #
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    // Compute luminance (https://www.w3.org/TR/WCAG20/#relativeluminancedef)
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };
  const luminance = hexToLuminance(color);

  return luminance > 0.5 ? "dark" : "light";
};
