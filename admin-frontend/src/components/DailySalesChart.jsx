import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumnIncreasing } from "lucide-react";

function DailySalesChart({ data, formatCurrency, periodLabel }) {
  return (
    <>
      <div className="chart-heading">
        <div>
          <h3><ChartColumnIncreasing size={18} aria-hidden="true" />Daily Sales</h3>
          <p>Revenue and order volume by day</p>
        </div>
        <span className="chart-period-label">{periodLabel}</span>
      </div>

      <div className="daily-chart" role="img" aria-label="Daily revenue and order volume chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
            accessibilityLayer
          >
            <CartesianGrid stroke="#edf0f4" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={24}
              tick={{ fill: "#778292", fontSize: 11 }}
              tickFormatter={(date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            />
            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              width={62}
              tick={{ fill: "#778292", fontSize: 11 }}
              tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={34}
              tick={{ fill: "#778292", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              formatter={(value, name) => [name === "Revenue" ? formatCurrency(value) : value, name]}
              contentStyle={{ border: "1px solid #e5e9ef", borderRadius: 8, boxShadow: "0 8px 24px rgba(23,32,51,.1)" }}
            />
            <Legend verticalAlign="top" height={34} iconType="circle" />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              name="Revenue"
              fill="#eb6a2e"
              radius={[4, 4, 0, 0]}
              maxBarSize={34}
            />
            <Line
              yAxisId="orders"
              dataKey="orders"
              name="Orders"
              type="monotone"
              stroke="#39709b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#39709b", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default DailySalesChart;