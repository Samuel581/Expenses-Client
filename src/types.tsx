// src/types.ts

// Define the allowed categories in an array
export const EXPENSE_CATEGORIES = [
  "bills",
  "food",
  "leisure",
  "electronics",
  "utilities",
  "clothing",
  "health",
  "others",
] as const;

// Define the type based on the categories array
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// Define the Expense type to use in components
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
}
