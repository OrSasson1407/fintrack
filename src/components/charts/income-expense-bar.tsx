"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface IncomeExpenseBarProps {
  data: { month: string; income: number; expenses: number }[];
  currency: string;
}

export function IncomeExpenseBar({ data, currency }: IncomeExpenseBarProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-slate-400">
          No data yet
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Income",
        data: data.map((d) => d.income),
        backgroundColor: "#10b981",
        borderRadius: 6,
      },
      {
        label: "Expenses",
        data: data.map((d) => d.expenses),
        backgroundColor: "#f43f5e",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 16, usePointStyle: true, pointStyle: "circle" },
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label: string }; parsed: { y: number } }) => {
            return `${context.dataset.label}: ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}