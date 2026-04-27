"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface TrendLineChartProps {
  data: { label: string; amount: number }[];
  title: string;
  color: string;
  currency: string;
}

export function TrendLineChart({ data, title, color, currency }: TrendLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-mono text-xs uppercase tracking-widest">
        No data yet
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: title,
        data: data.map((d) => d.amount),
        borderColor: color,
        borderWidth: 2,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, `${color}40`); // 25% opacity
          gradient.addColorStop(1, `${color}00`); // 0% opacity
          return gradient;
        },
        fill: true,
        tension: 0.4, // Smooth curves
        pointRadius: 3,
        pointBackgroundColor: "var(--surface)",
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointHoverRadius: 6, // Expands on hover
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { family: 'monospace', size: 11, weight: 'normal' as const },
        titleColor: '#a1a1aa', // text-muted-foreground
        bodyFont: { family: 'sans-serif', size: 14, weight: 'bold' as const },
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false, // Hides the little square color box
      callbacks: {
          label: (context: any) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(context.parsed.y || 0);
          },
        },
      },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { 
          color: "rgba(255, 255, 255, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: { family: 'monospace', size: 10 },
          color: '#71717a', // zinc-500
          callback: (value: any) => {
            if (value === 0) return '$0';
            return value >= 1000 ? `$${value/1000}k` : `$${value}`;
          }
        }
      },
      x: { 
        grid: { 
          display: false,
          drawBorder: false, 
        },
        ticks: {
          font: { family: 'monospace', size: 10, weight: 'bold' as const },
          color: '#a1a1aa',
        }
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}