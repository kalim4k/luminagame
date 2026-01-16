import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <p className="text-muted-foreground text-xs md:text-sm font-medium">
          {label}
        </p>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <p className="text-xl md:text-2xl font-bold text-foreground">
          {value}
        </p>

        {trend && (
          <div className={`flex items-center text-xs font-semibold ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};
