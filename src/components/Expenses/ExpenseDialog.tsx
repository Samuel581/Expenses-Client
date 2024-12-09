import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { EXPENSE_CATEGORIES, ExpenseCategory } from "../../types";
import {
  Select,
  SelectContent,
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
import { CalendarIcon } from "lucide-react";

interface ExpenseDialogProps {
  onSubmit: (expenseData: {
    description: string;
    category: ExpenseCategory;
    expenseDate: string;
    amount: number;
  }) => void;
  expense?: {
    description: string;
    category: ExpenseCategory;
    expenseDate: string;
    amount: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({
  onSubmit,
  expense,
  isOpen,
  onOpenChange,
}) => {
  const [description, setDescription] = useState(expense?.description || "");
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category || "bills" // default to a valid category
  );
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(
    expense ? new Date(expense.expenseDate) : undefined
  );
  const [amount, setAmount] = useState(expense ? expense.amount.toString() : "");

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setExpenseDate(new Date(expense.expenseDate));
    }
  }, [expense]);

  const handleSave = () => {
    if (!description || !category || !expenseDate || !amount) return;

    onSubmit({
      description,
      category,
      expenseDate: expenseDate.toISOString(),
      amount: parseFloat(amount),
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setDescription("");
    setCategory("bills");
    setExpenseDate(undefined);
    setAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add a New Expense"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Label>Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon />
                {expenseDate ? expenseDate.toDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={expenseDate}
                onSelect={setExpenseDate}
              />
            </PopoverContent>
          </Popover>
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>
            {expense ? "Save changes" : "Add expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
