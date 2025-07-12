import React from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#00C49F", "#FF8042"]; // Green for income, orange for expense

const InsightsChart = ({ income, expense }) => {
  const data = [
    { name: "Income", value: income },
    { name: "Expense", value: expense },
  ];

  // Skip rendering if both are 0
  if (income === 0 && expense === 0) return null;

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h4 style={{ marginBottom: "10px", textAlign: "center" }}>
        Income vs Expense
      </h4>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightsChart;
