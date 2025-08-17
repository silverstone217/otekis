import { Store } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button"; // shadcn/ui button

const NoShopFind = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-[70dvh] max-w-4xl mx-auto px-4 text-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">
        {`Aucune boutique n'a été trouvée.`}
      </h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
        Créez une nouvelle boutique en cliquant sur le bouton ci-dessous et
        commencez à réaliser vos rêves.
      </p>

      <Link href="/ma-boutique/creer" passHref>
        <Button
          variant="default"
          size="lg"
          className="inline-flex items-center gap-3 px-8"
        >
          <Store className="w-5 h-5" />
          Créer une boutique
        </Button>
      </Link>
    </div>
  );
};

export default NoShopFind;
