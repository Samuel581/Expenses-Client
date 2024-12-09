import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import apiClient from "@/api/axiosClient";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
    Bar,
    BarChart
} from "recharts";

import { SyncLoader } from "react-spinners";

import {ExpenseCategory } from "@/types";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6384",
  "#36A2EB",
  "#4BC0C0",
];

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
}

export default function SpendingTrends() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await apiClient.get("/expense");
        setExpenses(response.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Group and sum amounts by day with a date validity check
  const groupedData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.expenseDate);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date found: ${expense.expenseDate}`);
      return acc; // Skip this expense if the date is invalid
    }
    const dateString = format(date, "yyyy-MM-dd"); // Format date to "yyyy-MM-dd" string
    if (!acc[dateString]) {
      acc[dateString] = { date: dateString, amount: 0 };
    }
    acc[dateString].amount += expense.amount;

    return acc;
  }, {} as Record<string, { date: string; amount: number }>);

  const groupMonthlyExpenses = (expenses: Expense[]) => {
    const monthlyData = expenses.reduce((acc, expense) => {
      const month = format(new Date(expense.expenseDate), "yyyy-MM"); //Get months by year and month
      acc[month] = (acc[month] ?? 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)

    return Object.entries(monthlyData).map(([month, total]) => ({
      month,
      total,
    }));
  }
  const monthlyExpenses = groupMonthlyExpenses(expenses);
  console.log(monthlyExpenses);
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenses]);

  // Convert object to array for recharts
  const chartData = Object.values(groupedData);
  // Sort chartData by date in ascending order
  chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const navigate = useNavigate();
  {
    console.log(expenses);
  }

  const handleGoToDashboard = () => {
    navigate("/expenses");
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col gap-10">
      <div className="flex flex-row gap-5 text-center px-auto pt-5">
        <h1>Spending trends</h1>
        <Button onClick={handleGoToDashboard}>
          Back to Expenses Dashboard
        </Button>
      </div>
      {loading ? (
        <SyncLoader />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <h1 className="text-center font-bold pt-5">Amount spent by date</h1>
          <ResponsiveContainer width="95%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                display="description"
              />
            </LineChart>
          </ResponsiveContainer>

          <h1 className="text-center font-bold pt-5">Spending trends by Category</h1>
          <ResponsiveContainer width="95%" height={400}>
            <PieChart>
              <Pie
              data={categoryData}
              dataKey="amount"
              nameKey="category"
              cx={"50%"}
              cy={"50%"}
              outerRadius={120}
              fill={"#0088FE"}
              label={({percent}) => `${percent.toFixed(2)*100}%`}
              >
                {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
          <h1 className="text-center font-bold pt-5">Amount spend by month</h1>
          <ResponsiveContainer width={"95%"} height={400}>
            <BarChart data={monthlyExpenses} width={730} height={250}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
