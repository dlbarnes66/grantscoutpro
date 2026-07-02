"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ApplicationReviewPage() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadApp = async () => {
      const res = await fetch(`/api/applications/${id}`);
      const data = await res.json();
      setApp(data);
      setLoading(false);
    };

    loadApp();
  }, [id]);

  const submitApplication = async () => {
    setSubmitting(true);

    await fetch(`/api/applications/${id}/submit`, {
      method: "POST",
    });

    alert("Application submitted!");
    window.location.href = "/dashboard/applications";
  };

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading review…
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
          Review & Submit Application
        </h1>
        <p className="text-muted mt-2">
          Carefully review all sections before submitting your application.
        </p>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="section-title">Application Summary</h2>

        <p className="text-gray-700 mt-2">
          <span className="font-semibold">Grant:</span> {app.grantTitle}
        </p>

        <p className="text-gray-700 mt-1">
          <span className="font-semibold">Status:</span>{" "}
          {app.submitted ? "Submitted" : "In Progress"}
        </p>

        <p className="text-gray-700 mt-1">
          <span className="font-semibold">Progress:</span>{" "}
          {app.completedSections} / {app.totalSections} sections completed
        </p>
      </div>

      {/* Narrative Preview */}
      <div className="card">
        <h2 className="section-title">Narrative Preview</h2>

        <p className="text-muted mt-2">
          Review your main proposal narrative before submitting.
        </p>

        <textarea
          className="textarea mt-4 w-full h-64"
          value={app.narrative || ""}
          readOnly
        />

        <Link
          href={`/dashboard/applications/${id}`}
          className="btn btn-secondary mt-4"
        >
          Edit Narrative
        </Link>
      </div>

      {/* Documents */}
      <div className="card">
        <h2 className="section-title">Uploaded Documents</h2>

        <p className="text-muted mt-2">
          Ensure all required documents are uploaded.
        </p>

        <div className="mt-6 space-y-3">
          {app.requiredDocuments.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between">
              <span>{doc.label}</span>

              {doc.uploaded ? (
                <span className="text-green-600 font-semibold">Uploaded</span>
              ) : (
                <span className="text-red-600 font-semibold">Missing</span>
              )}
            </div>
          ))}
        </div>

        <Link
          href={`/dashboard/applications/${id}`}
          className="btn btn-secondary mt-6"
        >
          Manage Documents
        </Link>
      </div>

      {/* Final Checklist */}
      <div className="card">
        <h2 className="section-title">Final Checklist</h2>

        <ul className="mt-4 space-y-2 text-gray-700">
          <li>• Narrative is complete and accurate</li>
          <li>• All required documents are uploaded</li>
          <li>• Information is reviewed for accuracy</li>
          <li>• You are ready to submit</li>
        </ul>
      </div>

      {/* Submit */}
      <div className="card">
        <h2 className="section-title">Submit Application</h2>

        <p className="text-muted mt-2">
          Once submitted, you will not be able to make further changes.
        </p>

        <button
          disabled={!app.readyToSubmit || submitting}
          onClick={submitApplication}
          className={`btn mt-6 ${
            app.readyToSubmit ? "btn-success" : "btn-disabled"
          }`}
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 flex gap-4">
        <Link href={`/dashboard/applications/${id}`} className="btn btn-secondary">
          Back to Application
        </Link>

        <Link href="/dashboard/applications" className="btn btn-success">
          Applications Home
        </Link>
      </div>
    </div>
  );
}
