"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Grant = {
  id: string;
  title: string;
  summary: string;
  amount?: string | null;
  deadline?: string | null;
  category?: string | null;
  agency?: string | null;
  url?: string | null;
  content?: string | null;

  eligibilityScore?: number | null;
  fitScore?: number | null;
  riskScore?: number | null;
  competitiveness?: number | null;
  fundingStrength?: number | null;
  overallScore?: number | null;

  fitExplanation?: string | null;
  risks?: string | null;
  nextSteps?: string | null;
};

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedGrants, setSelectedGrants] = useState<string[]>([]);
  const [modalGrant, setModalGrant] = useState<Grant | null>(null);
  const [savingGrantId, setSavingGrantId] = useState<string | null>(null);

  async function fetchJob() {
    setRefreshing(true);

    const res = await fetch(`/api/jobs/${id}`, {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setJob(data.job || null);
      setLogs(data.logs || []);
    }

    setLoading(false);
    setRefreshing(false);
  }

  async function retryJob() {
    await fetch(`/api/jobs/${id}/retry`, {
      method: "POST",
      credentials: "include",
    });
    fetchJob();
  }

  async function cancelJob() {
    await fetch(`/api/jobs/${id}/cancel`, {
      method: "POST",
      credentials: "include",
    });
    fetchJob();
  }

  async function saveGrant(grant: Grant) {
    if (!grant?.id) return;
    setSavingGrantId(grant.id);

    await fetch("/api/saved-grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        grantId: grant.id,
        title: grant.title,
        agency: grant.agency,
        url: grant.url,
      }),
    });

    setSavingGrantId(null);
  }

  function toggleCompare(grantId: string) {
    setSelectedGrants((prev) =>
      prev.includes(grantId)
        ? prev.filter((id) => id !== grantId)
        : [...prev, grantId]
    );
  }

  function goToCompare() {
    if (selectedGrants.length < 2) return;
    const query = new URLSearchParams({
      ids: selectedGrants.join(","),
    }).toString();
    router.push(`/compare?${query}`);
  }

  useEffect(() => {
    fetchJob();

    const interval = setInterval(fetchJob, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading job details…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Job not found.
      </div>
    );
  }

  const grants: Grant[] = Array.isArray(job.result) ? job.result : [];

  function scoreColor(score?: number | null) {
    if (score == null) return "bg-gray-200 text-gray-700";
    if (score >= 0.75) return "bg-green-100 text-green-700";
    if (score >= 0.5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  }

  function ScoreBadge({
    label,
    score,
    title,
  }: {
    label: string;
    score?: number | null;
    title?: string;
  }) {
    return (
      <div
        className={`px-3 py-1 rounded-full text-xs ${scoreColor(score)}`}
        title={title}
      >
        {label}: {score != null ? score.toFixed(2) : "N/A"}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8 relative">
        <h1 className="text-3xl font-bold mb-4">Job Details</h1>

        {/* Job Info */}
        <div className="mb-6 space-y-2">
          <p>
            <span className="font-semibold">Job ID:</span> {job.id}
          </p>
          <p>
            <span className="font-semibold">Query:</span> {job.text}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-3 py-1 rounded text-white ${
                job.status === "completed"
                  ? "bg-green-600"
                  : job.status === "failed"
                  ? "bg-red-600"
                  : job.status === "cancelled"
                  ? "bg-gray-500"
                  : "bg-blue-600"
              }`}
            >
              {job.status}
            </span>
          </p>
          <p>
            <span className="font-semibold">Created:</span>{" "}
            {new Date(job.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Updated:</span>{" "}
            {new Date(job.updatedAt).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={retryJob}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
          >
            Retry
          </button>

          <button
            onClick={cancelJob}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={fetchJob}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>

        {/* Logs */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Logs</h2>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    logs
                      .map(
                        (l) =>
                          `[${new Date(l.createdAt).toLocaleString()}] ${
                            l.message
                          }`
                      )
                      .join("\n")
                  )
                }
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
              >
                Copy All
              </button>

              <button
                onClick={() => {
                  const content = logs
                    .map(
                      (l) =>
                        `[${new Date(l.createdAt).toLocaleString()}] ${
                          l.message
                        }`
                    )
                    .join("\n");

                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `job-${id}-logs.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
              >
                Download
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="text-gray-600">No logs yet.</p>
          ) : (
            <div
              id="logs-container"
              className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-black text-green-400 font-mono text-sm"
            >
              {logs.map((log) => {
                let color = "text-green-400";
                const msg = log.message.toLowerCase();

                if (msg.includes("error") || msg.includes("fail"))
                  color = "text-red-400";
                else if (msg.includes("warn")) color = "text-yellow-300";
                else if (msg.includes("info")) color = "text-blue-300";

                return (
                  <div key={log.id} className={color}>
                    [{new Date(log.createdAt).toLocaleTimeString()}]{" "}
                    {log.message}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Extracted Grants */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Extracted Grants</h2>

          {!grants || grants.length === 0 ? (
            <p className="text-gray-600">No grants extracted yet.</p>
          ) : (
            <div className="space-y-6">
              {grants.map((grant) => {
                const isSelected = selectedGrants.includes(grant.id);
                return (
                  <div
                    key={grant.id}
                    className="p-6 border rounded-xl bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{grant.title}</h3>

                        {grant.agency && (
                          <p className="text-gray-700 mt-1">
                            <span className="font-semibold">Agency:</span>{" "}
                            {grant.agency}
                          </p>
                        )}

                        {grant.amount && (
                          <p className="text-gray-700">
                            <span className="font-semibold">Amount:</span>{" "}
                            {grant.amount}
                          </p>
                        )}

                        {grant.deadline && (
                          <p className="text-gray-700">
                            <span className="font-semibold">Deadline:</span>{" "}
                            {grant.deadline}
                          </p>
                        )}

                        {grant.category && (
                          <p className="text-gray-700">
                            <span className="font-semibold">Category:</span>{" "}
                            {grant.category}
                          </p>
                        )}

                        {grant.summary && (
                          <p className="text-gray-700 mt-2">
                            <span className="font-semibold">Summary:</span>{" "}
                            {grant.summary}
                          </p>
                        )}

                        {grant.url && (
                          <a
                            href={grant.url}
                            target="_blank"
                            className="text-blue-600 underline mt-3 inline-block"
                          >
                            View Grant
                          </a>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        {/* Overall Score */}
                        <ScoreBadge
                          label="Overall"
                          score={grant.overallScore}
                          title="Overall opportunity score (0–1)"
                        />

                        {/* Sub-scores */}
                        <div className="flex flex-wrap gap-2 justify-end mt-1">
                          <ScoreBadge
                            label="Eligibility"
                            score={grant.eligibilityScore}
                            title="How well you meet formal eligibility criteria"
                          />
                          <ScoreBadge
                            label="Fit"
                            score={grant.fitScore}
                            title="Alignment with your mission, programs, and priorities"
                          />
                          <ScoreBadge
                            label="Risk"
                            score={
                              grant.riskScore != null
                                ? 1 - grant.riskScore
                                : undefined
                            }
                            title="Lower is better risk; shown inverted for clarity"
                          />
                          <ScoreBadge
                            label="Competitiveness"
                            score={grant.competitiveness}
                            title="How competitive this opportunity is likely to be"
                          />
                          <ScoreBadge
                            label="Funding Strength"
                            score={grant.fundingStrength}
                            title="Strength of funding relative to your needs"
                          />
                        </div>

                        {/* Compare checkbox */}
                        <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCompare(grant.id)}
                          />
                          Compare
                        </label>

                        {/* Save button */}
                        <button
                          onClick={() => saveGrant(grant)}
                          disabled={savingGrantId === grant.id}
                          className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50"
                        >
                          {savingGrantId === grant.id
                            ? "Saving..."
                            : "Save Grant"}
                        </button>

                        {/* Details button */}
                        <button
                          onClick={() => setModalGrant(grant)}
                          className="mt-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Compare Bar */}
        {selectedGrants.length > 0 && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-white shadow-lg border rounded-full px-6 py-3 flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {selectedGrants.length} grant
                {selectedGrants.length > 1 ? "s" : ""} selected for comparison
              </span>
              <button
                onClick={goToCompare}
                disabled={selectedGrants.length < 2}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm disabled:opacity-50"
              >
                Compare {selectedGrants.length >= 2 ? "Now" : "(select 2+)"}
              </button>
              <button
                onClick={() => setSelectedGrants([])}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {modalGrant && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{modalGrant.title}</h2>
                <button
                  onClick={() => setModalGrant(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {modalGrant.agency && (
                <p className="text-gray-700">
                  <span className="font-semibold">Agency:</span>{" "}
                  {modalGrant.agency}
                </p>
              )}

              {modalGrant.amount && (
                <p className="text-gray-700">
                  <span className="font-semibold">Amount:</span>{" "}
                  {modalGrant.amount}
                </p>
              )}

              {modalGrant.deadline && (
                <p className="text-gray-700">
                  <span className="font-semibold">Deadline:</span>{" "}
                  {modalGrant.deadline}
                </p>
              )}

              {modalGrant.category && (
                <p className="text-gray-700">
                  <span className="font-semibold">Category:</span>{" "}
                  {modalGrant.category}
                </p>
              )}

              <div className="mt-4">
                <p className="text-gray-800">
                  <span className="font-semibold">Summary:</span>{" "}
                  {modalGrant.summary}
                </p>
              </div>

              {modalGrant.content && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Full Extracted Content
                  </h3>
                  <div className="border rounded-lg p-3 bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap">
                    {modalGrant.content}
                  </div>
                </div>
              )}

              {modalGrant.url && (
                <a
                  href={modalGrant.url}
                  target="_blank"
                  className="text-blue-600 underline mt-4 inline-block"
                >
                  Open Grant Page
                </a>
              )}

              {/* Scoring in modal */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Opportunity Scoring
                </h3>
                <div className="flex flex-wrap gap-2">
                  <ScoreBadge
                    label="Overall"
                    score={modalGrant.overallScore}
                    title="Overall opportunity score (0–1)"
                  />
                  <ScoreBadge
                    label="Eligibility"
                    score={modalGrant.eligibilityScore}
                    title="How well you meet formal eligibility criteria"
                  />
                  <ScoreBadge
                    label="Fit"
                    score={modalGrant.fitScore}
                    title="Alignment with your mission, programs, and priorities"
                  />
                  <ScoreBadge
                    label="Risk"
                    score={
                      modalGrant.riskScore != null
                        ? 1 - modalGrant.riskScore
                        : undefined
                    }
                    title="Lower is better risk; shown inverted for clarity"
                  />
                  <ScoreBadge
                    label="Competitiveness"
                    score={modalGrant.competitiveness}
                    title="How competitive this opportunity is likely to be"
                  />
                  <ScoreBadge
                    label="Funding Strength"
                    score={modalGrant.fundingStrength}
                    title="Strength of funding relative to your needs"
                  />
                </div>
              </div>

              {/* Explanations */}
              {modalGrant.fitExplanation && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-1">
                    Why This Grant Fits You
                  </h3>
                  <p className="text-gray-800 text-sm">
                    {modalGrant.fitExplanation}
                  </p>
                </div>
              )}

              {modalGrant.risks && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-1">
                    Risks / Challenges
                  </h3>
                  <p className="text-gray-800 text-sm">{modalGrant.risks}</p>
                </div>
              )}

              {modalGrant.nextSteps && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-1">
                    Recommended Next Steps
                  </h3>
                  <p className="text-gray-800 text-sm">{modalGrant.nextSteps}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
