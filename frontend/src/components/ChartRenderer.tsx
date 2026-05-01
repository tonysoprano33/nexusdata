"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Lightbulb } from "lucide-react";
import { buildChartStory } from "@/lib/business-intelligence";

interface ChartData {
  type: string;
  title: string;
  insight?: string;
  // For bar, line, area
  x?: string[];
  y?: number[];
  x_label?: string;
  y_label?: string;
  // For pie
  labels?: string[];
  values?: number[];
  // For scatter
  data?: number[][];
  // For heatmap
  categories?: string[];
}

interface ChartRendererProps {
  chartData: ChartData;
  index: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export default function ChartRenderer({ chartData, index }: ChartRendererProps) {
  const { type, title, insight, x, y, labels, values, data, categories } = chartData;
  const story = buildChartStory(chartData);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        const barData = x?.map((label, i) => ({ name: label, value: y?.[i] || 0 })) || [];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" tick={{ fill: '#999' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        const lineData = x?.map((label, i) => ({ name: label, value: y?.[i] || 0 })) || [];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" tick={{ fill: '#999' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={3}
                dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        const areaData = x?.map((label, i) => ({ name: label, value: y?.[i] || 0 })) || [];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                tick={{ fill: '#999', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" tick={{ fill: '#999' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS[index % COLORS.length]} 
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = labels?.map((label, i) => ({ 
          name: label, 
          value: values?.[i] || 0 
        })) || [];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? 'N/A'}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        const scatterData = data?.map(([x, y]) => ({ x, y })) || [];
        if (scatterData.length === 0 && x && y) {
          const combined = x.map((xi, i) => ({ x: xi, y: y[i] }));
          return (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" dataKey="x" stroke="#666" tick={{ fill: '#999' }} name={chartData.x_label} />
                <YAxis type="number" dataKey="y" stroke="#666" tick={{ fill: '#999' }} name={chartData.y_label} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Scatter data={combined} fill={COLORS[index % COLORS.length]} />
              </ScatterChart>
            </ResponsiveContainer>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" dataKey="x" stroke="#666" tick={{ fill: '#999' }} />
              <YAxis type="number" dataKey="y" stroke="#666" tick={{ fill: '#999' }} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Scatter data={scatterData} fill={COLORS[index % COLORS.length]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'box':
      case 'boxplot':
        // Boxplot custom usando SVG
        const boxData = chartData.data || [];
        const boxCategories = chartData.categories || [];
        if (boxData.length > 0 && boxCategories.length > 0) {
          return (
            <BoxPlotChart 
              data={boxData} 
              categories={boxCategories} 
              color={COLORS[index % COLORS.length]}
            />
          );
        }
        return (
          <div className="h-[300px] flex items-center justify-center text-neutral-500">
            Not enough data for a boxplot
          </div>
        );

      case 'heatmap':
        const heatmapData = chartData.data || [];
        const heatmapLabels = chartData.labels || categories || [];
        if (heatmapData.length > 0 && heatmapLabels.length > 0) {
          return (
            <HeatmapChart 
              data={heatmapData} 
              labels={heatmapLabels}
            />
          );
        }
        return (
          <div className="h-[300px] flex items-center justify-center text-neutral-500">
            Not enough data for a heatmap
          </div>
        );

      case 'histogram':
        const histValues = chartData.values || y || [];
        if (histValues.length > 0) {
          return (
            <HistogramChart 
              values={histValues}
              color={COLORS[index % COLORS.length]}
            />
          );
        }
        return (
          <div className="h-[300px] flex items-center justify-center text-neutral-500">
            Not enough data for a histogram
          </div>
        );

      default:
        return (
          <div className="h-[300px] flex items-center justify-center text-neutral-500">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <Card className="bg-neutral-900 border-white/10 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-xs border-white/10 text-neutral-400 capitalize">
            {type}
          </Badge>
        </div>
        <CardDescription className="flex items-start gap-2 text-sm text-neutral-400 mt-2 leading-relaxed">
          <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <span>{story || insight}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// Componente BoxPlotChart
function BoxPlotChart({ data, categories, color }: { data: number[][], categories: string[], color: string }) {
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 60, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const boxWidth = Math.min(60, chartWidth / categories.length * 0.6);
  
  const calculateBoxPlot = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const median = sorted[Math.floor(sorted.length * 0.5)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const iqr = q3 - q1;
    const lowerFence = Math.max(min, q1 - 1.5 * iqr);
    const upperFence = Math.min(max, q3 + 1.5 * iqr);
    return { q1, q3, median, min, max, lowerFence, upperFence };
  };
  
  const allValues = data.flat();
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yRange = yMax - yMin || 1;
  
  const scaleY = (val: number) => margin.top + chartHeight - ((val - yMin) / yRange) * chartHeight;
  const scaleX = (i: number) => margin.left + (i + 0.5) * (chartWidth / categories.length);
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 300 }}>
      {/* Ejes */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#444" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#444" />
      
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={tick}>
          <line 
            x1={margin.left} 
            y1={scaleY(yMin + tick * yRange)} 
            x2={width - margin.right} 
            y2={scaleY(yMin + tick * yRange)} 
            stroke="#333" 
            strokeDasharray="3,3"
          />
          <text x={margin.left - 10} y={scaleY(yMin + tick * yRange) + 4} textAnchor="end" fill="#666" fontSize="10">
            {(yMin + tick * yRange).toFixed(0)}
          </text>
        </g>
      ))}
      
      {/* Boxplots */}
      {data.map((values, i) => {
        const stats = calculateBoxPlot(values);
        const x = scaleX(i);
        
        return (
          <g key={i}>
            {/* Línea vertical */}
            <line x1={x} y1={scaleY(stats.lowerFence)} x2={x} y2={scaleY(stats.upperFence)} stroke={color} strokeWidth={2} />
            {/* Whiskers horizontales */}
            <line x1={x - boxWidth/4} y1={scaleY(stats.lowerFence)} x2={x + boxWidth/4} y2={scaleY(stats.lowerFence)} stroke={color} strokeWidth={2} />
            <line x1={x - boxWidth/4} y1={scaleY(stats.upperFence)} x2={x + boxWidth/4} y2={scaleY(stats.upperFence)} stroke={color} strokeWidth={2} />
            {/* Caja */}
            <rect x={x - boxWidth/2} y={scaleY(stats.q3)} width={boxWidth} height={scaleY(stats.q1) - scaleY(stats.q3)} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={2} />
            {/* Mediana */}
            <line x1={x - boxWidth/2} y1={scaleY(stats.median)} x2={x + boxWidth/2} y2={scaleY(stats.median)} stroke="#fff" strokeWidth={2} />
            {/* Label */}
            <text x={x} y={height - margin.bottom + 20} textAnchor="middle" fill="#999" fontSize="11" transform={`rotate(-45, ${x}, ${height - margin.bottom + 20})`}>
              {categories[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Componente HeatmapChart
function HeatmapChart({ data, labels }: { data: number[][], labels: string[] }) {
  const cellSize = 40;
  const gap = 2;
  const margin = { top: 50, left: 100 };
  const width = Math.max(400, labels.length * (cellSize + gap) + margin.left);
  const height = Math.max(300, labels.length * (cellSize + gap) + margin.top);
  
  const allValues = data.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  
  const getColor = (value: number) => {
    const normalized = (value - minVal) / (maxVal - minVal || 1);
    // Gradiente de azul a rojo
    const r = Math.round(99 + (239 - 99) * normalized);
    const g = Math.round(102 + (68 - 102) * normalized);
    const b = Math.round(241 + (68 - 241) * (1 - normalized));
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minHeight: 300 }}>
        {/* Título eje Y */}
        {labels.map((label, i) => (
          <text key={`y-${i}`} x={margin.left - 10} y={margin.top + i * (cellSize + gap) + cellSize/2 + 4} textAnchor="end" fill="#999" fontSize="11">
            {label}
          </text>
        ))}
        
        {/* Título eje X */}
        {labels.map((label, i) => (
          <text key={`x-${i}`} x={margin.left + i * (cellSize + gap) + cellSize/2} y={margin.top - 10} textAnchor="middle" fill="#999" fontSize="11" transform={`rotate(-45, ${margin.left + i * (cellSize + gap) + cellSize/2}, ${margin.top - 10})`}>
            {label}
          </text>
        ))}
        
        {/* Celdas */}
        {data.map((row, i) => 
          row.map((value, j) => (
            <g key={`${i}-${j}`}>
              <rect
                x={margin.left + j * (cellSize + gap)}
                y={margin.top + i * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                fill={getColor(value)}
                rx={4}
              />
              <text
                x={margin.left + j * (cellSize + gap) + cellSize/2}
                y={margin.top + i * (cellSize + gap) + cellSize/2 + 4}
                textAnchor="middle"
                fill={Math.abs(value) > (maxVal - minVal) / 2 ? '#fff' : '#000'}
                fontSize="10"
              >
                {value.toFixed(2)}
              </text>
            </g>
          ))
        )}
      </svg>
    </div>
  );
}

// Componente HistogramChart
function HistogramChart({ values, color }: { values: number[], color: string }) {
  const bins = 20;
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins || 1;
  
  const histogram = Array(bins).fill(0);
  values.forEach(v => {
    const binIndex = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    histogram[binIndex]++;
  });
  
  const maxCount = Math.max(...histogram);
  const barWidth = chartWidth / bins;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 300 }}>
      {/* Ejes */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#444" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#444" />
      
      {/* Barras */}
      {histogram.map((count, i) => {
        const barHeight = (count / maxCount) * chartHeight;
        const x = margin.left + i * barWidth;
        const y = height - margin.bottom - barHeight;
        
        return (
          <g key={i}>
            <rect
              x={x + 1}
              y={y}
              width={barWidth - 2}
              height={barHeight}
              fill={color}
              fillOpacity={0.7}
              rx={2}
            />
          </g>
        );
      })}
      
      {/* Labels X */}
      {[0, bins/2, bins-1].map(i => (
        <text key={i} x={margin.left + (i + 0.5) * barWidth} y={height - margin.bottom + 20} textAnchor="middle" fill="#666" fontSize="10">
          {(min + i * binWidth).toFixed(0)}
        </text>
      ))}
      
      {/* Labels Y */}
      {[0, 0.5, 1].map(tick => (
        <text key={tick} x={margin.left - 10} y={height - margin.bottom - tick * chartHeight + 4} textAnchor="end" fill="#666" fontSize="10">
          {Math.round(tick * maxCount)}
        </text>
      ))}
    </svg>
  );
}
