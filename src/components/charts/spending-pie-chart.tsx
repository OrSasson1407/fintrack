"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingPieChartProps {
  data: { name: string; amount: number; color: string }[];
  currency: string;
}

export function SpendingPieChart({ data, currency }: SpendingPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-mono text-xs uppercase tracking-widest">
        No expense data yet
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: data.map((d) => d.color),
        borderWidth: 2,
        borderColor: "var(--surface)", // Matches background perfectly to create gaps
        hoverOffset: 12, // The premium slice pop-out effect
        borderRadius: 4, // Slightly rounded slice edges
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // Makes it a sleek thin ring
    plugins: {
      legend: {
        position: "right" as const,
        labels: { 
          padding: 20, 
          usePointStyle: true, 
          pointStyle: "circle",
          color: '#a1a1aa', // text-muted-foreground
          font: { family: 'monospace', size: 11 }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { family: 'monospace', size: 11, weight: 'normal' as const },
        bodyFont: { family: 'sans-serif', size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: { label: string; parsed: number }) => {
            return ` ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(context.parsed)}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full flex justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}