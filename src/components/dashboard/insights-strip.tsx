import { Lightbulb, TrendingUp, TrendingDown, Award } from "lucide-react";

export function InsightsStrip({ 
  insights 
}: { 
  insights: { text: string; type: "positive" | "negative" | "info" }[] 
}) {
  if (insights.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {insights.map((insight, i) => (
        <div 
          key={i} 
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-2 shadow-sm animate-slide-right" 
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {insight.type === "positive" && <Award size={13} className="text-acid" />}
          {insight.type === "negative" && <TrendingDown size={13} className="text-expense" />}
          {insight.type === "info" && <Lightbulb size={13} className="text-blue-400" />}
          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-text-secondary mt-px">
            {insight.text}
          </span>
        </div>
      ))}
    </div>
  );
}