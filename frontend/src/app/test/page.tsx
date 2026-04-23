"use client";

import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export default function TestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const runTests = async () => {
    setResults([]);
    setLoading(true);

    try {
      // Test 1: Health check
      log("Test 1: Health check...");
      try {
        const health = await axios.get(`${API_URL}/api/health`, { timeout: 10000 });
        log(`✅ Health: ${JSON.stringify(health.data)}`);
      } catch (e: any) {
        log(`❌ Health failed: ${e.message}`);
      }

      // Test 2: Root endpoint
      log("Test 2: Root endpoint...");
      try {
        const root = await axios.get(`${API_URL}/`, { timeout: 10000 });
        log(`✅ Root: ${JSON.stringify(root.data)}`);
      } catch (e: any) {
        log(`❌ Root failed: ${e.message}`);
      }

      // Test 3: Upload CSV
      log("Test 3: Upload CSV...");
      try {
        const csv = "name,age,city\nAlice,30,NYC\nBob,25,LA\n";
        const blob = new Blob([csv], { type: "text/csv" });
        const formData = new FormData();
        formData.append("file", blob, "test.csv");
        formData.append("provider", "gemini");

        const upload = await axios.post(`${API_URL}/api/datasets/upload`, formData, {
          timeout: 60000,
          headers: { "Content-Type": "multipart/form-data" },
        });
        log(`✅ Upload success: ID=${upload.data.id}, Status=${upload.data.status}`);
        log(`   Insights preview: ${upload.data.insights?.substring(0, 50)}...`);
      } catch (e: any) {
        log(`❌ Upload failed: ${e.message}`);
        if (e.response) {
          log(`   Status: ${e.response.status}`);
          log(`   Data: ${JSON.stringify(e.response.data)}`);
        }
      }

      log("Tests complete!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Backend Test Page</h1>
      <p className="mb-4 text-gray-400">API URL: {API_URL}</p>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Tests"}
      </button>

      <div className="mt-6 space-y-2 font-mono text-sm">
        {results.map((r, i) => (
          <div key={i} className={r.startsWith("❌") ? "text-rose-400" : r.startsWith("✅") ? "text-emerald-400" : "text-gray-300"}>
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}
