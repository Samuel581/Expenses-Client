import { useEffect, useState, useMemo } from "react";
import apiClient from "../api/axiosClient";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  FilePenLine,
  Trash2,
} from "lucide-react";
//import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableCaption,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/hooks/useAuth";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
}

const EXPENSE_CATEGORIES = [
  "bills",
  "food",
  "leisure",
  "electronics",
  "utilities",
  "clothing",
  "health",
  "others",
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "">(
    ""
  );

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null); // Holds the expense being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Controls the edit dialog visibility

  const { logout } = useAuth();

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

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value as ExpenseCategory);
    table.getColumn("category")?.setFilterValue(value);
  };

  const handleAddExpense = async () => {
    if (!description || !category || !date || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await apiClient.post("/expense", {
        description,
        category,
        expenseDate: date.toISOString(),
        amount: parseFloat(amount),
      });
      setExpenses((prev) => [...prev, response.data]);

      // Clear form fields
      setDescription("");
      setCategory("");
      setDate(undefined);
      setAmount("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to add expense:", error);
      setError("Failed to add expense.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      if (error instanceof Error) setError(error.message);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense); // Set the selected expense for editing
    setDescription(expense.description);
    setCategory(expense.category);
    setDate(new Date(expense.expenseDate)); // Convert date to Date object
    setAmount(expense.amount.toString()); // Convert amount to string for input
    setIsEditDialogOpen(true); // Open the dialog
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) {
      alert("No expense selected for editing.");
      return;
    }

    const updatedFields: Partial<Expense> = {};

    if (description && description !== editingExpense.description) {
      updatedFields.description = description;
    }
    if (category && category !== editingExpense.category) {
      updatedFields.category = category;
    }
    if (date && date.toISOString() !== editingExpense.expenseDate) {
      updatedFields.expenseDate = date.toISOString();
    }
    if (amount && parseFloat(amount) !== editingExpense.amount) {
      updatedFields.amount = parseFloat(amount);
    }

    // Only proceed if there are updates to send
    if (Object.keys(updatedFields).length === 0) {
      alert("No changes were made.");
      return;
    }

    try {
      const response = await apiClient.patch(
        `/expense/${editingExpense.id}`,
        updatedFields
      );
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingExpense.id ? response.data : expense
        )
      );

      // Clear fields and close the dialog
      setEditingExpense(null);
      setDescription("");
      setCategory("");
      setDate(undefined);
      setAmount("");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update expense:", error);
      setError("Failed to update expense.");
    }
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

  return (
    <div className="w-screen min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center mt-10">
        Your Expenses
      </h1>
      <div className="flex justify-evenly">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="px-auto">
              Add expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a new expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="bills">Bills</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="leisure">Leisure</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddExpense}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant={"destructive"} className="mr-0" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="px-auto mx-10">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bills">Bills</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter descriptions..."
            value={
              (table.getColumn("description")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("description")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Category</Label>
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter></TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="font-semibold">
              Total
            </TableCell>
            <TableCell className="text-center text-green-600 font-semibold">
              ${total.toFixed(2)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </Table>
      </div>
    </div>
  );
};

export default Expenses;
