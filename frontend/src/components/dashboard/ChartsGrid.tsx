"use client";
import { ChartContainer } from "@/components/enterprise/ChartContainer";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import type { ChartData } from "@/types/analysis";
import { BoxPlotChart, HeatmapChart, HistogramChart } from "./ComplexCharts";
import { 
  ResponsiveContainer, BarChart as ReBarChart, Bar, LineChart as ReLineChart, Line, AreaChart as ReAreaChart, Area, 
  PieChart as RePieChart, Pie, Cell, ScatterChart as ReScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export function ChartsGrid({ charts_data }: { charts_data?: ChartData[] }) {
  if (!charts_data || charts_data.length === 0) {
    return (
      <Card className="bg-[#141416] border-white/[0.06] p-12 text-center">
        <BarChart3 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No visualizations available</h3>
        <p className="text-neutral-500 text-sm">Charts will be generated once AI analysis is complete.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {charts_data.map((chart, index) => (
        <ChartRenderer key={index} chartData={chart} index={index} />
      ))}
    </div>
  );
}

function ChartRenderer({ chartData, index }: { chartData: ChartData; index: number }) {
  const { type, title, insight, x, y, labels, values, data, categories } = chartData;
  const color = CHART_COLORS[index % CHART_COLORS.length];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }))} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }))} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }))} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
            </ReAreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={labels?.map((l, i) => ({ name: l, value: values?.[i] || 0 }))} cx="50%" cy="45%" outerRadius={80} dataKey="value" label>
                {labels?.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </RePieChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" dataKey="x" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis type="number" dataKey="y" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={data?.map(([xVal, yVal]) => ({ x: xVal, y: yVal }))} fill={color} />
            </ReScatterChart>
          </ResponsiveContainer>
        );
      case 'box':
      case 'boxplot':
        return data && categories ? <BoxPlotChart data={data} categories={categories} color={color} /> : null;
      case 'heatmap':
        return data && (labels || categories) ? <HeatmapChart data={data} labels={labels || categories || []} /> : null;
      case 'histogram':
        return <HistogramChart values={values || y || []} color={color} />;
      default:
        return <div className="h-full flex items-center justify-center text-neutral-500">Visualization not supported yet.</div>;
    }
  };

  return (
    <ChartContainer title={title} insight={insight} type={type} index={index}>
      {renderChart()}
    </ChartContainer>
  );
}
