import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  Order,
  DeliveryOrder,
  ProductOrigin,
  DeliveryCompany,
} from "@/lib/generated/prisma/client";
import { returnDataValue } from "@/utils/functions";
import { ColorsData } from "@/utils/dataAdd";
import { capitalizeText } from "@/utils/shopFunctions";
import { returnPaymentMethodLabel } from "@/utils/supplier";

// Définition exacte du type reçu depuis ton composant parent
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

type OtekisInvoiceProps = {
  order: Order;
  shop: {
    id: string;
    name: string;
    logo: string;
    slug: string;
  };
  deliveryInfo: DeliveryOrder | null;
  products: OrderProductsType[];
};

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#0F172A" },
  subtitle: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    tracking: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  label: { color: "#64748B" },
  value: { fontWeight: "bold" },
  table: {
    marginTop: 15,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    alignItems: "flex-end",
  },
  totalContainer: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 12, fontWeight: "bold", color: "#0F172A" },
  totalPrice: { fontSize: 14, fontWeight: "bold", color: "#10B981" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    textAlign: "center",
    fontSize: 9,
    color: "#94A3B8",
  },
});

// 1. FACTURE DE LA COMMANDE OTEKIS (SUPPORT MULTI-PRODUITS)
export const OtekisProductInvoice = ({
  order,
  shop,
  products,
}: OtekisInvoiceProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>FACTURE D'ACHAT</Text>
          <Text style={styles.subtitle}>Otekis Platform • Vente Standard</Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "bold" }}>
            REF: #{order.id.slice(0, 10).toUpperCase()}
          </Text>
          <Text style={{ color: "#64748B", marginTop: 4 }}>
            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>
      </View>

      {/* CLIENT + SHOP */}
      <View style={{ flexDirection: "row", gap: 30, marginBottom: 30 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.value}>{order.receiverName}</Text>
          <Text style={styles.label}>+243 {order.receiverTel}</Text>
          <Text style={[styles.label, { textTransform: "capitalize" }]}>
            {capitalizeText(order.receiverAddress)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Boutique</Text>
          <Text style={styles.value}>{capitalizeText(shop.name)}</Text>
          <Text style={[styles.label, { textTransform: "capitalize" }]}>
            Paiement:{" "}
            {returnPaymentMethodLabel
              ? returnPaymentMethodLabel(order.paymentMethod)
              : order.paymentMethod}{" "}
            • {capitalizeText(order.paymentStatus)}
          </Text>
          <Text style={styles.label}>
            Référence paiement: {order.paymentRef || "N/A"}
          </Text>
        </View>
      </View>

      {/* ARTICLES (Boucle map sur le tableau de produits) */}
      <Text style={styles.sectionTitle}>Articles commandés</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Désignation</Text>
          <Text style={styles.col2}>Qté</Text>
          <Text style={styles.col3}>Prix Unitaire</Text>
        </View>

        {products.map((item) => (
          <View key={item.orderItemId} style={styles.tableRow}>
            <Text style={[styles.col1, { textTransform: "capitalize" }]}>
              {capitalizeText(item.product.name)}
              {item.article.color
                ? ` • ${capitalizeText(returnDataValue(item.article.color, ColorsData))}`
                : ""}
              {item.article.size ? ` • Taille ${item.article.size}` : ""}
              {item.article.flavor ? ` • Gout ${item.article.flavor}` : ""}
              {item.article.volume ? ` • Volume ${item.article.volume}` : ""}
            </Text>

            <Text style={styles.col2}>{item.quantity}</Text>

            <Text style={styles.col3}>
              {item.price * order.exchange} {order.currency}
            </Text>
          </View>
        ))}
      </View>

      {/* TOTALS */}
      <View style={styles.totalSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.label}>Sous-total</Text>
          <Text>
            {order.totalAmount} {order.currency}
          </Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.label}>Livraison</Text>
          <Text>
            {order.deliveryPrice} {order.currency}
          </Text>
        </View>

        <View
          style={[
            styles.totalContainer,
            {
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
              paddingTop: 6,
            },
          ]}
        >
          <Text style={styles.totalLabel}>Total payé</Text>
          <Text style={styles.totalPrice}>
            {order.totalAmount + order.deliveryPrice} {order.currency}
          </Text>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>
        Document officiel généré par Otekis • Merci pour votre confiance.
      </Text>
    </Page>
  </Document>
);

// 2. FACTURE DE LA LIVRAISON OTEKIS
export const OtekisDeliveryInvoice = ({
  order,
  shop,
  deliveryInfo,
  deliveryCompany,
}: OtekisInvoiceProps & {
  deliveryCompany: {
    id: string;
    name: string;
    phone: string;
  } | null;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: "#1D4ED8" }]}>
            BON DE LIVRAISON OFFICIEL
          </Text>
          <Text style={styles.subtitle}>
            Otekis Logistics • Document de transport
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "bold" }}>
            BL-{order.id.slice(0, 10).toUpperCase()}
          </Text>
          <Text style={{ color: "#64748B", marginTop: 4 }}>
            {new Date(order.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>
      </View>

      {/* META */}
      <View
        style={{
          marginBottom: 18,
          padding: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          borderRadius: 6,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 10, textTransform: "capitalize" }}>
          Statut: {order.status}
        </Text>
        <Text style={{ fontSize: 10 }}>
          Code validation: {order.ValidationCode || "N/A"}
        </Text>
        <Text style={{ fontSize: 10 }}>
          Expédition: {order.ShipmentNumber || "N/A"}
        </Text>
      </View>

      {/* BLOCKS */}
      <View style={{ flexDirection: "row", gap: 30, marginBottom: 20 }}>
        {/* DESTINATAIRE */}
        <View
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 6,
          }}
        >
          <Text style={styles.sectionTitle}>Destinataire</Text>
          <Text style={[styles.value, { textTransform: "capitalize" }]}>
            {order.receiverName}
          </Text>
          <Text style={styles.label}>+243 {order.receiverTel}</Text>
          <Text style={styles.label}>
            {capitalizeText(order.receiverAddress)}
          </Text>
        </View>

        {/* TRANSPORTEUR */}
        <View
          style={{
            flex: 1,
            padding: 10,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 6,
          }}
        >
          <Text style={styles.sectionTitle}>Transporteur</Text>
          <Text style={[styles.value, { textTransform: "capitalize" }]}>
            {deliveryCompany?.name || "Otekis Logistics Standard"}
          </Text>
          <Text style={styles.label}>
            Contact: {deliveryCompany?.phone || "N/A"}
          </Text>
          <Text style={[styles.label, { textTransform: "capitalize" }]}>
            Origine: {capitalizeText(shop.name)}
          </Text>
        </View>
      </View>

      {/* TABLE */}
      <Text style={styles.sectionTitle}>Détails du service</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Service</Text>
          <Text style={styles.col2}>Type</Text>
          <Text style={styles.col3}>Montant</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            Livraison colis - Commandé chez {capitalizeText(shop.name)}
          </Text>
          <Text style={styles.col2}>Standard</Text>
          <Text style={styles.col3}>
            {order.deliveryPrice} {order.currency}
          </Text>
        </View>
      </View>

      {/* TOTAL */}
      <View style={styles.totalSection}>
        <View
          style={{
            width: 220,
            padding: 12,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            borderRadius: 6,
            backgroundColor: "#F8FAFC",
          }}
        >
          <View style={styles.totalContainer}>
            <Text style={styles.label}>Frais livraison</Text>
            <Text>
              {order.deliveryPrice} {order.currency}
            </Text>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
              marginTop: 6,
              paddingTop: 6,
            }}
          >
            <Text style={[styles.totalLabel, { fontSize: 12 }]}>
              TOTAL LOGISTIQUE
            </Text>
            <Text style={styles.label}>
              {order.deliveryPrice} {order.currency}
            </Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <Text style={styles.footer}>Document officiel Otekis Logistics</Text>
    </Page>
  </Document>
);
