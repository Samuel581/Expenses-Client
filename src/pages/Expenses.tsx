import { useEffect, useState, useMemo } from "react";
import apiClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, FilePenLine, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import ExpenseTable from "@/components/Expenses/ExpenseTable";
import ExpenseDialog from "@/components/Expenses/ExpenseDialog";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
}

import { EXPENSE_CATEGORIES, ExpenseCategory } from "../types";

const Expenses = () => {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "">(
    ""
  );
  const [total, setTotal] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null); // Holds the expense being edited
  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Expense ID",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "description",
        header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Description
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </div>
          );
        },
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "expenseDate",
        header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Date
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </div>
          );
        },
        cell: (info) =>
          format(new Date(info.getValue() as string), "MMMM dd, yyyy"),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => (
          <Badge variant="default">{info.getValue() as string}</Badge>
        ),
        filterFn: (row, id, value) => {
          return value === "" || row.getValue(id) === value;
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Amount
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : null}
            </div>
          );
        },
        cell: (info) => (
          <div className="text-center text-green-600 font-semibold">
            ${(info.getValue() as number).toFixed(2)}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <div className="flex flex-row gap-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleEdit(expense)}
              >
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );
  const table = useReactTable({
    data: expenses,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await apiClient.get("/expense"); // API call to fetch expenses
        setExpenses(response.data);
        setTotal(
          response.data.reduce(
            (acc: number, expense: Expense) => acc + expense.amount,
            0
          )
        );
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };
    fetchExpenses();
  }, []);

  //Handlers
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value as ExpenseCategory);
    table.getColumn("category")?.setFilterValue(value);
  };
  const handleAddOrEditExpense = async (expenseData: {
    description: string;
    category: ExpenseCategory;
    expenseDate: string;
    amount: number;
  }) => {
    if (editingExpense) {
      // Edit expense
      try {
        const response = await apiClient.patch(
          `/expense/${editingExpense.id}`,
          expenseData
        );
        setExpenses((prev) =>
          prev.map((expense) =>
            expense.id === editingExpense.id ? response.data : expense
          )
        );
      } catch (error) {
        console.error("Failed to update expense:", error);
        setError("Failed to update expense.");
      }
    } else {
      // Add new expense
      try {
        const response = await apiClient.post("/expense", expenseData);
        setExpenses((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Failed to add expense:", error);
        setError("Failed to add expense.");
      }
    }

    // Reset dialog state
    setEditingExpense(null);
    setIsDialogOpen(false);
  };
  
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense); // Set the selected expense for editing
  };
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmed) return; // Exit if user cancels

    try {
      await apiClient.delete(`/expense/${id}`);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id)); // Remove expense from state
    } catch (error) {
      console.error("Failed to delete expense:", error);
      setError("Failed to delete expense.");
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    }
  };

  const handleSeeStatistics = () => {
    navigate("/trends")
  };
  
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center mt-10">
        Your Expenses
      </h1>

      {error && <p className="text-red-500">{error}</p>}
      <div className="px-auto mx-10">
        <div className="flex flex-row gap-5 mb-5">
          <Button
            variant="default"
            onClick={() => {
              setIsDialogOpen(true);
              setEditingExpense(null); // Reset editingExpense for add mode
            }}
          >
            Add Expense
          </Button>
          <ExpenseDialog
            isOpen={isDialogOpen || !!editingExpense}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingExpense(null); // Reset on close
            }}
            onSubmit={handleAddOrEditExpense}
            expense={editingExpense || undefined} // If editing, pass the expense
          />
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Filter descriptions..."
              value={
                (table.getColumn("description")?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn("description")
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Select
              value={categoryFilter || "all"} // Default to "all" if categoryFilter is empty
              onValueChange={(value) =>
                handleCategoryFilter(
                  value === "all" ? "" : (value as ExpenseCategory)
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant={"destructive"}
            className="ml-auto"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        <ExpenseTable table={table} columns={columns} total={total} />
      </div>
      <div className="flex flex-row gap-5 justify-end px-10">
        <Button variant={"default"} onClick={handleSeeStatistics}>See statistics</Button>
        <Button className="bg-green-600">Export to CSV</Button>
      </div>
    </div>
  );
};

export default Expenses;
