"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ApplicationPage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadApp = async () => {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      setApp(data);
      setLoading(false);
    };

    loadApp();
  }, [id]);

  const updateField = async (field: string, value: string) => {
    setSaving(true);

    await fetch(`/api/applications/${id}/update`, {
      method: "POST",
      body: JSON.stringify({ field, value }),
    });

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading application…
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center text-red-600 text-lg py-20">
        Application not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Application for {app.grantTitle}
        </h1>
        <p className="text-muted mt-2">
          Complete each section and upload required documents.
        </p>
      </div>

      {/* Progress Summary */}
      <div className="card">
        <h2 className="section-title">Progress Overview</h2>

        <p className="text-gray-700 mt-2">
          {app.completedSections} of {app.totalSections} sections completed
        </p>

        <div className="w-full bg-gray-200 h-3 rounded mt-4">
          <div
            className="bg-blue-600 h-3 rounded"
            style={{
              width: `${(app.completedSections / app.totalSections) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Narrative Section */}
      <div className="card">
        <h2 className="section-title">Narrative Response</h2>
        <p className="text-muted mt-2">
          Provide your main proposal narrative. You can refine this using the AI tools.
        </p>

        <textarea
          className="textarea mt-4 w-full h-64"
          defaultValue={app.narrative || ""}
          onBlur={(e) => updateField("narrative", e.target.value)}
        />

        {saving && (
          <p className="text-muted text-sm mt-2">Saving…</p>
        )}

        <Link
          href={`/dashboard/grants/${app.grantId}/write`}
          className="btn btn-secondary mt-4"
        >
          Improve with AI Writer
        </Link>
      </div>

      {/* Document Uploads */}
      <div className="card">
        <h2 className="section-title">Required Documents</h2>

        <p className="text-muted mt-2">
          Upload PDFs, Word documents, or supporting materials.
        </p>

        <div className="mt-6 space-y-4">
          {app.requiredDocuments.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between">
              <span className="font-medium">{doc.label}</span>

              {doc.uploaded ? (
                <span className="text-green-600 font-semibold">Uploaded</span>
              ) : (
                <label className="btn btn-primary cursor-pointer">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("docId", doc.id);

                      await fetch(`/api/applications/${id}/upload`, {
                        method: "POST",
                        body: formData,
                      });

                      window.location.reload();
                    }}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submission */}
      <div className="card">
        <h2 className="section-title">Submit Application</h2>

        <p className="text-muted mt-2">
          Once all sections are complete and documents uploaded, you can submit.
        </p>

        <button
          disabled={!app.readyToSubmit}
          onClick={async () => {
            await fetch(`/api/applications/${id}/submit`, {
              method: "POST",
            });

            alert("Application submitted!");
            window.location.href = "/dashboard/applications";
          }}
          className={`btn mt-6 ${
            app.readyToSubmit ? "btn-success" : "btn-disabled"
          }`}
        >
          Submit Application
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 flex gap-4">
        <Link href="/dashboard/applications" className="btn btn-secondary">
          Back to Applications
        </Link>

        <Link href="/dashboard" className="btn btn-success">
          Dashboard Home
        </Link>
      </div>
    </div>
  );
}
