import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import archiver from "archiver";
import streamBuffers from "stream-buffers";
import { getUser } from "@/actions/actions";

// 🧾 Liste des tables importantes à sauvegarder
const tablesToExport = [
  "User",
  "Facture",
  "Shop",
  "WithdrawalHistory",
  "OtekisBenefitAmount",
] as const;

const ROLES = ["super_admin"];

export async function GET() {
  try {
    const user = await getUser();

    if (!user || !ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }

    const zipBufferStream = new streamBuffers.WritableStreamBuffer();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(zipBufferStream);

    for (const table of tablesToExport) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const data = await prisma[table].findMany();
      if (!data.length) continue;

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, table);

      const xlsxBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
      archive.append(xlsxBuffer, { name: `${table}.xlsx` });
    }

    await archive.finalize();
    const zipBuffer = zipBufferStream.getContents();
    if (!zipBuffer) throw new Error("ZIP vide");

    const uint8Array = new Uint8Array(zipBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=backup-${
          new Date().toISOString().split("T")[0]
        }.zip`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur export" }, { status: 500 });
  }
}
