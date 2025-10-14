"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Mail, MessageSquare, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    consent: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }
    if (!form.consent) {
      toast.error("Vous devez accepter le traitement de vos informations.");
      return;
    }

    setLoading(true);

    try {
      // 📨 Ici tu pourras intégrer ton server action ou API d’envoi de mail
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success("Message envoyé avec succès !");
      setForm({ name: "", email: "", message: "", consent: false });
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      id="contact"
      className="pt-10 pb-2 px-4 md:px-8 bg-gray-50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Nous contacter
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Une question, une suggestion ou besoin d’assistance ? Remplissez le
            formulaire ci-dessous et notre équipe vous répondra dans les plus
            brefs délais.
          </p>
        </div>

        <Card className="shadow-sm border rounded-2xl bg-white">
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 text-left"
              noValidate
            >
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Nom complet
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="jean kabeya"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" /> Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-600" /> Votre
                  message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Écrivez votre message ici..."
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  disabled={loading}
                  required
                  className="min-h-32"
                />
              </div>

              {/* Consentement */}
              <div className="flex items-center justify-between gap-4 border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="consent"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <ShieldCheck size={16} className="text-blue-600" />
                    Autorisation de traitement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    J’autorise le traitement de mes informations pour être
                    contacté par l’équipe Otekis.
                  </p>
                </div>
                <Switch
                  id="consent"
                  checked={form.consent}
                  onCheckedChange={(checked) =>
                    handleChange("consent", checked)
                  }
                  disabled={loading}
                />
              </div>

              {/* Bouton */}
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={
                  !form.name ||
                  !form.email ||
                  !form.message ||
                  !form.consent ||
                  loading
                }
              >
                {loading ? "Envoi..." : "Soumettre"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
