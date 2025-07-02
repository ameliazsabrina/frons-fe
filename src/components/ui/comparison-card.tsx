import React from "react";
import { Card, CardContent } from "./card";

interface ComparisonCardProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  variant: "traditional" | "fronsciers";
  className?: string;
}

export function ComparisonCard({
  title,
  icon,
  items,
  variant,
  className = "",
}: ComparisonCardProps) {
  const isTraditional = variant === "traditional";
  const cardClasses = isTraditional
    ? "rounded-lg border-red-200 hover:shadow-lg transition-shadow duration-300"
    : "rounded-lg g-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:shadow-lg transition-shadow duration-300 ";

  const iconBgClasses = isTraditional ? "bg-red-100" : "bg-green-100";
  const iconColorClasses = isTraditional ? "text-red-600" : "text-green-600";
  const bulletColorClasses = isTraditional ? "bg-red-500" : "bg-green-500";

  return (
    <div className={`w-1/2 h-[500px] ${className}`}>
      <Card className={`h-full ${cardClasses}`}>
        <CardContent className="p-8 h-full flex flex-col">
          <div className="text-center space-y-6 flex-1">
            <div
              className={`w-16 h-16 ${iconBgClasses} rounded-full flex items-center justify-center mx-auto`}
            >
              <div className={`w-8 h-8 ${iconColorClasses}`}>{icon}</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <div className="space-y-4 text-left flex-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 ${bulletColorClasses} rounded-full mt-2 flex-shrink-0`}
                  ></div>
                  <p className="text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
