
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, variant, description }: StatsCardProps) {
  const variants = {
    default: 'gradient-blue text-white',
    success: 'gradient-success text-white',
    warning: 'gradient-warning text-white',
    danger: 'gradient-danger text-white',
  };

  const bgClass = variants[variant];

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className={`${bgClass} pb-3`}>
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <span>{title}</span>
          <Icon className="w-6 h-6" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value.toLocaleString()}
        </div>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
