"use client";
import { ChartContainer } from "@/components/enterprise/ChartContainer";
import { Card, CardInsight } from "@/components/ui/card";
import { BarChart3, Database, Info } from "lucide-react";
import type { ChartData } from "@/types/analysis";
import { BoxPlotChart, HeatmapChart, HistogramChart } from "./ComplexCharts";
import { 
  ResponsiveContainer, BarChart as ReBarChart, Bar, LineChart as ReLineChart, Line, AreaChart as ReAreaChart, Area, 
  PieChart as RePieChart, Pie, Cell, ScatterChart as ReScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const NEURAL_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#080808]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white">
          <span className="text-blue-400 mr-2">Value:</span>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function ChartsGrid({ charts_data }: { charts_data?: ChartData[] }) {
  if (!charts_data || charts_data.length === 0) {
    return (
      <Card className="p-20 flex flex-col items-center justify-center opacity-40">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-bold text-white uppercase tracking-widest text-xs">Awaiting Neural Visuals</h3>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {charts_data.map((chart, index) => (
        <ChartRenderer key={index} chartData={chart} index={index} />
      ))}
    </div>
  );
}

function ChartRenderer({ chartData, index }: { chartData: ChartData; index: number }) {
  const { type, title, insight, x, y, labels, values, data, categories } = chartData;
  const color = NEURAL_COLORS[index % NEURAL_COLORS.length];

  const renderChart = () => {
    const commonProps = {
       margin: { top: 20, right: 20, left: 0, bottom: 0 }
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }))} {...commonProps}>     
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff10" tick={{ fill: '#555', fontSize: 9 }} hide />
              <YAxis stroke="#ffffff10" tick={{ fill: '#555', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }))} {...commonProps}>    
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
              <XAxis dataKey="name" stroke="#ffffff10" hide />
              <YAxis stroke="#ffffff10" tick={{ fill: '#555', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ fill: color, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ReAreaChart data={x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }))} {...commonProps}>    
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#ffffff10" tick={{ fill: '#555', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${index})`} fillOpacity={1} strokeWidth={3} />
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ReAreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie data={labels?.map((l, i) => ({ name: l, value: values?.[i] || 0 }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {labels?.map((_, i) => <Cell key={i} fill={NEURAL_COLORS[i % NEURAL_COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="h-[300px] flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Processing Visualization...</div>;
    }
  };

  return (
    <Card className="overflow-visible">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <BarChart3 className={cn("w-5 h-5", index % 2 === 0 ? "text-blue-400" : "text-purple-400")} />
             </div>
             <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Cluster analysis</p>
             </div>
          </div>
          <div className="flex items-center gap-1 text-zinc-600">
             <Info className="w-4 h-4 cursor-help hover:text-white transition-colors" />
          </div>
       </div>
       
       <div className="relative">
         {renderChart()}
       </div>

       {insight && (
         <CardInsight label="Strategic Note" className="mt-8 bg-blue-500/5 border-blue-500/10">
            {insight}
         </CardInsight>
       )}
    </Card>
  );
}
