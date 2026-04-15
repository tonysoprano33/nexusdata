"use client";
import { Card, CardInsight } from "@/components/ui/card";
import { BarChart3, Info, Activity } from "lucide-react";
import type { ChartData } from "@/types/analysis";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, BarChart as ReBarChart, Bar, LineChart as ReLineChart, Line, AreaChart as ReAreaChart, Area, 
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const MONO_COLORS = ['#ffffff', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-zinc-800 p-3 rounded-sm shadow-2xl">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-white">
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
      <div className="py-32 text-center border border-dashed border-zinc-900 rounded-sm">
        <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Awaiting Neural Visuals</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
      {charts_data.map((chart, index) => (
        <ChartRenderer key={index} chartData={chart} index={index} />
      ))}
    </div>
  );
}

function ChartRenderer({ chartData, index }: { chartData: ChartData; index: number }) {
  const { type, title, insight, x, y, labels, values } = chartData;
  
  const renderChart = () => {
    const data = x?.map((l, i) => ({ name: l, value: y?.[i] || 0 }));
    const commonProps = { margin: { top: 10, right: 10, left: -20, bottom: 0 } };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <ReBarChart data={data} {...commonProps}>     
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#27272a" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
              <Bar dataKey="value" fill="#ffffff" radius={[2, 2, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <ReLineChart data={data} {...commonProps}>    
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#27272a" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#fff' }} />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie 
                data={labels?.map((l, i) => ({ name: l, value: values?.[i] || 0 }))} 
                cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value"
              >
                {labels?.map((_, i) => <Cell key={i} fill={MONO_COLORS[i % MONO_COLORS.length]} stroke="#000" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="h-[250px] flex items-center justify-center text-zinc-800 font-black text-[9px] uppercase tracking-widest">Protocol Unsupported</div>;
    }
  };

  return (
    <div className="bg-black p-10 space-y-10">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-sm border border-zinc-900 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-zinc-500" />
             </div>
             <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h3>
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.3em] mt-1">Neural Data Map</p>
             </div>
          </div>
       </div>
       
       <div className="relative">
         {renderChart()}
       </div>

       {insight && (
         <CardInsight label="Neural Note" variant="default" className="mt-6">
            {insight}
         </CardInsight>
       )}
    </div>
  );
}