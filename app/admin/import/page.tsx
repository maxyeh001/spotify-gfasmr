"use client";

import { useState } from "react";

type Status = "idle" | "importing" | "success" | "error";

export default function ImportPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading = status === "importing";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLogs([]);
    setErrorMessage(null);
    setStatus("importing");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: form,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // response wasn't JSON
      }

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.error ||
            `Import failed with status ${res.status} ${res.statusText}`
        );
        return;
      }

      const newLogs: string[] = data?.logs || [];
      setLogs(newLogs);
      setStatus("success");
    } catch (err: any) {
      console.error("Import request failed", err);
      setStatus("error");
      setErrorMessage(err?.message || "Network error while importing");
    }
  };

  // very simple analytics based on emojis in the log text
  const successCount = logs.filter((l) => l.includes("✅")).length;
  const warnCount = logs.filter((l) => l.includes("⚠️")).length;
  const errorCount = logs.filter((l) => l.includes("❌")).length;

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Bulk Import</h1>

      {/* STATUS + PROGRESS BAR */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">Status:</span>
          {status === "idle" && (
            <span className="px-2 py-1 text-xs rounded bg-neutral-800">
              Idle
            </span>
          )}
          {status === "importing" && (
            <span className="px-2 py-1 text-xs rounded bg-blue-600/80">
              Importing…
            </span>
          )}
          {status === "success" && (
            <span className="px-2 py-1 text-xs rounded bg-green-600/80">
              Completed
            </span>
          )}
          {status === "error" && (
            <span className="px-2 py-1 text-xs rounded bg-red-600/80">
              Error
            </span>
          )}
        </div>

        {/* Indeterminate progress bar while importing */}
        <div className="w-full bg-neutral-800 rounded h-2 overflow-hidden">
          <div
            className={
              status === "importing"
                ? "h-2 w-full bg-green-500 animate-pulse"
                : status === "success"
                ? "h-2 w-full bg-green-500"
                : status === "error"
                ? "h-2 w-full bg-red-500"
                : "h-2 w-0"
            }
          />
        </div>

        {/* Summary counts */}
        {logs.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-neutral-300">
            <span>{logs.length} log lines</span>
            <span className="text-green-400">✅ {successCount} success</span>
            {warnCount > 0 && (
              <span className="text-yellow-300">⚠️ {warnCount} warnings</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-400">❌ {errorCount} errors</span>
            )}
          </div>
        )}

        {/* Error message if any */}
        {errorMessage && (
          <div className="mt-2 text-sm text-red-400 bg-red-900/30 border border-red-700/50 rounded px-3 py-2">
            {errorMessage}
          </div>
        )}
      </div>

      {/* FORM */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 text-sm font-medium">
            CSV File <span className="text-red-400">*</span>
          </label>
          <input
            name="csv"
            type="file"
            accept=".csv"
            required
            className="text-black bg-neutral-100 rounded px-2 py-1"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Must include headers:
            <br />
            <code className="text-[11px]">
              audio_file,image_file,title,artist_name,artist_bio,playlist_name,
              playlist_position,audio_path,image_path
            </code>
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Upload Audio Files (song files)
          </label>
          <input
            name="songs"
            type="file"
            accept="audio/mp3"
            multiple
            className="text-black bg-neutral-100 rounded px-2 py-1"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Filenames must match the <code>audio_file</code> column (e.g.
            <code> whispers.mp3</code>).
          </p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Upload Images (cover art)
          </label>
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="text-black bg-neutral-100 rounded px-2 py-1"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Filenames must match the <code>image_file</code> column.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-500 disabled:bg-green-900 px-4 py-2 rounded font-semibold text-sm transition"
        >
          {isLoading ? "Importing…" : "Start Import"}
        </button>
      </form>

      {/* LOGS */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Logs</h2>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded max-h-[400px] overflow-y-auto text-xs font-mono whitespace-pre-wrap">
          {logs.length === 0 && status !== "importing" && (
            <div className="text-neutral-500">
              No logs yet. Run an import to see details here.
            </div>
          )}
          {status === "importing" && logs.length === 0 && (
            <div className="text-neutral-400 animate-pulse">
              Import started… waiting for server response.
            </div>
          )}
          {logs.map((l, i) => (
            <div key={i} className="leading-relaxed">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
