"use client";
import React, { useState, forwardRef } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  UserCog,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getBadgeClass, returnRoleWith } from "@/utils/functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserRoleData } from "@/utils/data";
import { changeAdminRole } from "@/actions/actions";
import { roleUserType } from "@/types/auth";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { capitalizeText } from "@/utils/shopFunctions";
import { UserTypeNoPassword } from "../users/UsersDataTable";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// --- Modifier le rôle d'un admin ---

const roleColors: Record<string, string> = {
  super_admin: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
  admin: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
  employee: "bg-gradient-to-r from-green-500 to-lime-500 text-white",
  // Ajoute d'autres rôles si besoin
};

export const ModifyRoleAdmin = forwardRef<
  HTMLDivElement,
  { admin: UserTypeNoPassword }
>(({ admin }, _ref) => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleChangeRole = async () => {
    setLoading(true);
    try {
      const newRole = await changeAdminRole(admin.id, role as roleUserType);
      if (!newRole) {
        toast.error("Erreur lors de la modification du rôle", {
          description: "Vous n'êtes pas un super administrateur.",
        });
        return;
      }
      toast.success("Rôle modifié avec succès", {
        description: `Le rôle de ${admin.name} a été modifié.`,
      });
      admin.role = newRole.role;
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la modification du rôle", {
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Style pour le badge rôle
  const badgeClass =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow " +
    (roleColors[admin.role] || "bg-gray-200 text-gray-800");

  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label="Modifier le rôle"
        disabled={user?.role !== "super_admin" || !admin}
        className="hover:bg-indigo-50 transition px-2"
      >
        <span className="text-sm">Modifier le role</span>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-gray-900 max-w-sm w-full rounded-2xl shadow-xl p-0 overflow-hidden">
        <AlertDialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <UserCog className="w-7 h-7 text-indigo-600" />
            <AlertDialogTitle className="text-lg font-bold">
              Modifier le rôle
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-sm text-gray-500">
            {`${admin.name} verra son rôle changé. Vous pouvez lui donner plus d'accès ou lui en retirer.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className={badgeClass}>{returnRoleWith(admin.role)}</span>
            <span className="text-xs text-gray-400">(Rôle actuel)</span>
          </div>
          <div className="text-xs text-gray-500">
            Créé le :{" "}
            <span className="font-medium">
              {new Date(admin.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <Select value={role} onValueChange={setRole} disabled={loading}>
            <SelectTrigger className="mt-2 w-full border-gray-200 focus:ring-indigo-500">
              <SelectValue placeholder="Choisir le nouveau rôle" />
            </SelectTrigger>
            <SelectContent>
              {UserRoleData.map((stat, idx) => (
                <SelectItem key={idx} value={stat.value} className="capitalize">
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter className="px-6 pb-4 pt-2 flex justify-end gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="rounded-lg px-4 py-2 text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={
              loading || !role || !admin || !user || role === admin.role
            }
            onClick={handleChangeRole}
            className="rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "En cours..." : "Continuer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
ModifyRoleAdmin.displayName = "ModifyRoleAdmin";

// --- Actions menu ---
const ActionsCell = ({ admins }: { admins: UserTypeNoPassword }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admins/admins/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admins.id }),
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      const data = await response.json();
      if (data.error) {
        toast.error("Erreur lors de la suppression", {
          description: data.error,
        });
        return;
      }
      toast.success("L'utilisateur a été supprimé.");
      router.refresh();
    } catch (error) {
      toast.error("Erreur lors de la suppression", {
        description: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(admins.id);
            toast.success("L'ID a été copié dans le presse-papier");
          }}
        >
          {`Copier l'ID`}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            location.replace("/utilisateurs/" + admins.id);
          }}
        >
          {`Voire le profile`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ModifyRoleAdmin admin={admins} />
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={loading}
          onClick={handleDelete}
          className="text-red-500 hover:text-red-600"
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- Colonnes ---
export const AdminsColumns: ColumnDef<UserTypeNoPassword>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const { image, name } = row.original;
      const ShortName = name ? name[0].toUpperCase() : "N";
      return (
        <Avatar>
          {image ? (
            <AvatarImage src={image} />
          ) : (
            <AvatarFallback>{ShortName}</AvatarFallback>
          )}
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        Nom
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="truncate block max-w-[180px]">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        Rôle
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant="default"
          className={`${getBadgeClass(
            role.toLocaleLowerCase()
          )} font-medium px-2 py-1 rounded`}
        >
          {capitalizeText(returnRoleWith(role))}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      const formatted = createdAt.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell admins={row.original} />,
  },
];

// --- Table principale ---
export function AdminsDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: { sorting, columnFilters, columnVisibility, pagination },
  });

  const admins = data as User[];
  const uniqueRole = Array.from(new Set(admins.map((dt) => dt.role)));

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm overflow-x-auto">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2">
        <Input
          placeholder="Filtrer par nom..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <Select
          onValueChange={(value) => {
            if (value === "all") {
              table.getColumn("role")?.setFilterValue(undefined);
            } else {
              table.getColumn("role")?.setFilterValue(value);
            }
          }}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filtrer par rôle..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {uniqueRole.map((role) => (
              <SelectItem key={role} value={role}>
                {returnRoleWith(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} sur {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
