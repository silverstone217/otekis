// Exemple pour afficher le contenu dans une page produit
export default function ProductDescription({ content }: { content: string }) {
  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
