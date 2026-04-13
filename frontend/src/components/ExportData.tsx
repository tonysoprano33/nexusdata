"use client";

import React from 'react';
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDataProps {
  data: {
    summary?: {
      total_rows?: number;
      total_columns?: number;
      data_quality_score?: number;
    };
    anomaly_detection?: {
      detected_rows?: number;
    };
    [key: string]: unknown;
  };
  filename?: string;
}

export default function ExportData({ data, filename = "analisis" }: ExportDataProps) {
  const exportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!data.summary) return;
    
    // Crear CSV con estadísticas
    let csv = 'Metrica,Valor\n';
    csv += `Filas analizadas,${data.summary.total_rows}\n`;
    csv += `Columnas,${data.summary.total_columns}\n`;
    csv += `Calidad de datos,${data.summary.data_quality_score}%\n`;
    csv += `Anomalias detectadas,${data.anomaly_detection?.detected_rows || 0}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_resumen.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "border-white/10 text-neutral-300 hover:bg-white/5"
        )}
      >
          <Download className="h-4 w-4 mr-2" />
          Exportar
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10">
        <DropdownMenuItem onClick={exportJSON} className="text-neutral-300 focus:bg-white/5 focus:text-white cursor-pointer">
          <FileJson className="h-4 w-4 mr-2" />
          Exportar JSON completo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV} className="text-neutral-300 focus:bg-white/5 focus:text-white cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar CSV resumen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
