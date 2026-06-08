"use client";

import { useState } from "react";

interface DraftResult {
  hire: { name: string; legalEntity: string; startDate: string; missingFields: string[] };
  email: { to: string; subject: string; body: string; realRecipientFirm: string };
  draftUrl: string;
}

export default function Home() {
  const [notionUrl, setNotionUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DraftResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notionUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payroll Notification</h1>
          <p className="mt-1 text-sm text-gray-500">
            Paste a Notion new-hire page URL to generate a payroll draft email.
            The draft is saved to Gmail — never sent automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notionUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Notion page URL
            </label>
            <input
              id="notionUrl"
              type="url"
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              placeholder="https://www.notion.so/..."
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Drafting..." : "Create payroll draft"}
          </button>
        </form>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-medium text-green-800">
                Draft created for {result.hire.name}
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Routed to {result.email.realRecipientFirm} &middot; Start {result.hire.startDate}
              </p>
              {result.hire.missingFields.length > 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  Missing fields (flagged in draft): {result.hire.missingFields.join(", ")}
                </p>
              )}
              <a
                href={result.draftUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
              >
                Open draft in Gmail
              </a>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">To: {result.email.to}</p>
              <p className="text-xs font-medium text-gray-500 mb-2">Subject: {result.email.subject}</p>
              <pre className="rounded-md bg-white border border-gray-200 p-4 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96">
                {result.email.body}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
