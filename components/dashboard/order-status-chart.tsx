"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { OrderStatus } from "@prisma/client"

interface OrderStatusChartProps {
  data: Record<OrderStatus, number>
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  // Transform the data into the format expected by recharts
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: formatStatus(status as OrderStatus),
    value: count,
  }))

  // Colors for the pie slices
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  function formatStatus(status: OrderStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Distribution of orders by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} orders`, ""]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

