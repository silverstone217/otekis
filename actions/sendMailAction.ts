"use server";

import { RESEND_API_KEY } from "@/utils/envVariables";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    await resend.emails.send({
      from: "Otekis <contact@otekis.com>", // ton domaine validé
      to: "servigroup.social@gmail.com", // où tu veux recevoir le mail
      subject: `Nouveau message de ${formData.name}`,
      replyTo: formData.email,
      html: `
        <h2>Nouveau message depuis le formulaire de contact</h2>
        <p><strong>Nom :</strong> ${formData.name}</p>
        <p><strong>Email :</strong> ${formData.email}</p>
        <p><strong>Message :</strong><br/>${formData.message}</p>
      `,
    });

    return { error: false };
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email:", error);
    return { error: true };
  }
}
