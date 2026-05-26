"use server";
import { getUser } from "@/actions/actions";
import { ProductOrigin } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { returnDataValue } from "@/utils/functions";

// GET ALL ORDERS FOR ADMIN DASHBOARD
export const getAdminsOrders = async () => {
  const user = await getUser();

  if (!user || !user.role.includes("admin")) {
    return [];
  }

  //   NORMALS ORDERS
  const adminsOrders = await prisma.order.findMany({
    include: {
      orderItems: true,
    },
  });

  const adminOrderWithDetails = adminsOrders.map((order) => {
    return {
      ...order,
      origin: "otekis",
      quantity:
        order.orderItems.reduce((acc, item) => acc + item.quantity, 0) || 0,
    };
  });

  //   SUPPLIERS ORDERS
  const suppliersOrders = await prisma.supplierOrder.findMany({});

  const suppliersOrdersWithDetails = suppliersOrders.map((order) => {
    return {
      ...order,
      origin: "supplier",
      quantity: order.quantity,
    };
  });

  const orders = [...adminOrderWithDetails, ...suppliersOrdersWithDetails].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return orders || [];
};

// GET ORDER BY ID FOR ADMIN DASHBOARD
export const getOtekisOrder = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id,
    },

    include: {
      // SHOP
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
          slug: true,
        },
      },

      // DELIVERY
      deliveryOrder: {
        include: {
          deliveryCompany: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      },

      // ITEMS
      orderItems: {
        include: {
          article: {
            include: {
              Product: {
                select: {
                  id: true,
                  uid: true,

                  name: true,
                  slug: true,
                  image: true,
                  images: true,

                  category: true,
                  type: true,
                  material: true,
                  brand: true,

                  price: true,
                  state: true,
                  quality: true,
                  target: true,

                  stock: true,
                  origin: true,

                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  // FORMAT FRONT CLEAN
  const formattedOrder = {
    ...order,

    products: order.orderItems.map((item) => ({
      // ORDER ITEM
      orderItemId: item.id,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      discount: item.discount,

      // ARTICLE
      article: {
        id: item.article.id,
        color: item.article.color,
        size: item.article.size,
        flavor: item.article.flavor,
        volume: item.article.volume,
        stock: item.article.stock,
        commandNumber: item.article.commandNumber,
      },

      // PRODUCT
      product: {
        id: item.article.Product.id,
        uid: item.article.Product.uid,

        name: item.article.Product.name,
        // slug: item.article.Product.slug,

        image: item.article.Product.image,
        // images: item.article.Product.images,

        category: item.article.Product.category,
        type: item.article.Product.type,
        // material: item.article.Product.material,
        // brand: item.article.Product.brand,

        price: item.article.Product.price,

        // state: item.article.Product.state,
        // quality: item.article.Product.quality,
        // target: item.article.Product.target,

        stock: item.article.Product.stock,
        origin: item.article.Product.origin,

        createdAt: item.article.Product.createdAt,
      },
    })),
  };

  return formattedOrder;
};

export type OrderProductsType = {
  orderItemId: string;
  quantity: number;
  price: number;
  currency: string;
  discount: number | null;

  article: {
    id: string;
    color: string | null;
    size: string | null;
    flavor: string | null;
    volume: string | null;
    stock: number;
    commandNumber: string;
  };

  product: {
    id: string;
    uid: string;
    name: string;
    image: string;
    category: string;
    type: string | null;
    price: number;
    stock: number;
    origin: ProductOrigin;
    createdAt: Date;
  };
};

// GET SUPPLIER ORDER BY ID FOR ADMIN DASHBOARD
