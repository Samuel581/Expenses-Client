import { useEffect, useState } from "react";
import apiClient from "../api/axiosClient";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FilePenLine } from "lucide-react";
import { Trash2 } from "lucide-react";
//import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableCaption,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableFooter
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

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {logout} = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await apiClient.get("/expense"); // API call to fetch expenses
        setExpenses(response.data);
        setTotal(response.data.reduce((acc: number, expense: Expense) => acc + expense.amount, 0));
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    };

    fetchExpenses();
  }, []);

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
      await logout()
    } catch (error) {
      if(error instanceof Error) setError(error.message);
      
    }
  }

  return (
    <div className="w-screen min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center mt-10">Your Expenses</h1>

      {error && <p className="text-red-500">{error}</p>}
      <div className="px-auto mx-10">
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
        <Button variant={"destructive"} className="mr-0" onClick={handleLogout}>Logout</Button>
        <Table className="mt-10">
          <TableCaption>A list of your recent expenses.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Expense ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead className="text-center">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.id}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  {format(new Date(expense.expenseDate), "MMMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="default">{expense.category}</Badge>
                </TableCell>
                <TableCell className="text-center text-green-600 font-semibold">${expense.amount}</TableCell>
                <TableCell className="flex flex-row gap-10">
                  <Button variant={"default"} className="w-full"><FilePenLine/></Button>
                  <Button variant={"destructive"} className="w-full"><Trash2/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter></TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-semibold">Total</TableCell>
              <TableCell className="text-center text-green-600 font-semibold">${total}</TableCell>
              <TableCell></TableCell>
            </TableRow>
        </Table>
      </div>
    </div>
  );
};

export default Expenses;
