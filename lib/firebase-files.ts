import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 } from "uuid";
import { storage } from "@/lib/firebase";

export const MAX_ZIP_SIZE = 10 * 1024 * 1024 * 1024;

const ZIP_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
  "", // certains navigateurs/OS ne renseignent pas le type
];

export const isZipFile = (file: File) =>
  file.name.toLowerCase().endsWith(".zip") &&
  ZIP_MIME_TYPES.includes(file.type);

export type UploadedFile = { url: string; path: string };

export async function uploadArticleFile(
  file: File,
  pathUrl: string,
): Promise<UploadedFile> {
  const imgId = v4().toString().replace(/-/g, "");
  const path = `${pathUrl}/${imgId}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: "application/zip",
    customMetadata: { originalName: file.name },
  });

  const url = await getDownloadURL(storageRef);
  return { url, path };
}

// Ne lance jamais d'erreur : utilisé dans le nettoyage
export async function deleteArticleFile(path: string) {
  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    console.error("Suppression du fichier Firebase échouée :", error);
  }
}
