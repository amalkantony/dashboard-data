"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CSVRecord } from "@/lib/csv-utils";
import { getStatistics } from "@/lib/csv-utils";

interface DataVisualizationsProps {
  data: CSVRecord[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B9D",
  "#C44569",
  "#4ECDC4",
];

export function DataVisualizations({ data }: DataVisualizationsProps) {
  const stats = React.useMemo(() => getStatistics(data), [data]);

  // Limit data for better visualization
  const topBuildings = stats.byBuilding.slice(0, 10);
  const topLocations = stats.byLocation.slice(0, 8);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Records Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {stats.total.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total number of records in selected dataset
          </p>
        </CardContent>
      </Card>

      {/* Unique Buildings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Unique Buildings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {stats.byBuilding.length.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Number of different buildings
          </p>
        </CardContent>
      </Card>

      {/* Unique Locations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Unique Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {stats.byLocation.length.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Number of different locations
          </p>
        </CardContent>
      </Card>

      {/* Records by Building Bar Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 Buildings by Record Count</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topBuildings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0088FE" name="Records" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Records by Location Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topLocations}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${(name ?? "").slice(0, 15)}... ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {topLocations.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
