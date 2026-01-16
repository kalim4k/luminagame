import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon }) => {
  return (
    <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <Icon size={20} />
        </div>
      </div>
      <p className="text-muted-foreground text-xs md:text-sm font-medium mb-1">{label}</p>
      <h3 className="text-lg md:text-2xl font-bold text-foreground">{value}</h3>
    </div>
  );
};
