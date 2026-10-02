import { AddNewArticle } from "@/components/admins/products/articles/AddOrModifyArticle";
import {
  ArticlesDataTable,
  ArticlesColumns,
} from "@/components/admins/products/articles/DisplayTableArticle";
import NotAuthorizedComponent from "@/components/NotAuthorizedComponent";
import NoUserComponent from "@/components/NoUserComponent";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/actions/actions";
import { SearchX } from "lucide-react";
import React from "react";
import { PERMITED_ROLES } from "@/utils/dataAdd";
import { AddDigitalArticle } from "@/components/admins/products/articles/DigitalArticle";

type Props = {
  params: Promise<{ id: string }>;
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      Article: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  return product;
};

const ArticlesPage = async (props: Props) => {
  const params = await props.params;
  const user = await getUser();
  if (!user) {
    return <NoUserComponent />;
  }

  const isPermitted = user ? PERMITED_ROLES.includes(user?.role) : false;

  if (!isPermitted) {
    return <NotAuthorizedComponent />;
  }

  const { id } = params;

  if (!id) {
    return (
      <div className="w-full max-w-7xl flex flex-col gap-6 h-[70dvh] items-center justify-center">
        <h1 className="xl:text-4xl text-2xl lg:text-3xl font-extrabold text-center">
          {"Rien trouvé!"}
        </h1>
        <p className="lg:text-xl text-center lg:w-3/5">
          {`Ce produit n'existe pas ou peut être a été supprimé ou est indisponible pour le moment`}
        </p>
        <SearchX className="w-16 h-14 opacity-70" />
      </div>
    );
  }

  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="w-full max-w-7xl flex flex-col gap-6 h-[70dvh] items-center justify-center">
        <h1 className="xl:text-4xl text-2xl lg:text-3xl font-extrabold text-center">
          {"Rien trouvé!"}
        </h1>
        <p className="lg:text-xl text-center lg:w-3/5">
          {`Ce produit n'existe pas ou peut etre a été supprimé ou est indisponible pour le moment`}
        </p>
        <SearchX className="w-16 h-14 opacity-70" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 transition-all duration-500 ease-in-out box-border">
      <div className="flex w-full items-start justify-between gap-y-4 lg:flex-row flex-col">
        <div className="transition-all duration-500 ease-in-out">
          <h2 className="text-2xl font-bold lg:text-4xl mb-2">
            Modifier le produit
          </h2>
          <p className="text-gray-800 lg:text-[17px] capitalize">
            <strong>{product.name}</strong>
          </p>
          <p className="text-gray-600 lg:text-[17px]">
            ID : <strong>{product.id}</strong>
          </p>
          <p className="text-gray-600 lg:text-[17px]">
            UID : <strong>{product.uid}</strong>
          </p>
          <p className="text-gray-600">
            ajouté le{" "}
            {new Date(product.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-600 lg:text-[17px] mt-4">
            Articles: <strong>{product.Article.length}</strong>
          </p>
        </div>
        {/* add items */}
        {/* navigate */}
        {(product.category === "vetements" ||
          product.category === "accessoires" ||
          product.category === "cosmetiques") && (
          <AddNewArticle product={product} />
        )}

        {product.category === "digital" && (
          <AddDigitalArticle product={product} />
        )}
      </div>
      {/* form */}
      {(product.category === "vetements" ||
        product.category === "accessoires" ||
        product.category === "cosmetiques") && (
        <ArticlesDataTable columns={ArticlesColumns} data={product.Article} />
      )}
    </div>
  );
};

export default ArticlesPage;
