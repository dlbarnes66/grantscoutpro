"use client";

export function GrantDetails({ grant }: { grant: any }) {
  return (
    <div className="space-y-8">

      {/* TITLE + SUMMARY */}
      <section>
        <h1 className="text-3xl font-bold text-slate-100">{grant.title}</h1>

        {grant.summary && (
          <p className="text-slate-300 text-lg mt-2">{grant.summary}</p>
        )}
      </section>

      {/* GRANT INFO */}
      <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="font-semibold text-xl text-slate-100 mb-4">Grant Info</h2>

        <ul className="space-y-2 text-slate-300 text-sm">
          {grant.agency && <li>Agency: {grant.agency}</li>}
          {grant.category && <li>Category: {grant.category}</li>}
          {grant.status && <li>Status: {grant.status}</li>}
          {grant.deadline && (
            <li>
              Deadline: {new Date(grant.deadline).toLocaleDateString()}
            </li>
          )}
          {grant.location && <li>Location: {grant.location}</li>}
          {grant.industry && <li>Industry: {grant.industry}</li>}
          {grant.geographicFocus && (
            <li>Geographic Focus: {grant.geographicFocus}</li>
          )}
          {grant.eligibleApplicants && (
            <li>Eligible Applicants: {grant.eligibleApplicants}</li>
          )}
          {grant.ineligibleApplicants && (
            <li>Ineligible Applicants: {grant.ineligibleApplicants}</li>
          )}
        </ul>
      </section>

      {/* FINANCIALS */}
      <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="font-semibold text-xl text-slate-100 mb-4">Financials</h2>

        <ul className="space-y-2 text-slate-300 text-sm">
          {grant.amount && <li>Amount: ${grant.amount}</li>}
          {grant.amountMin && <li>Min Award: ${grant.amountMin}</li>}
          {grant.amountMax && <li>Max Award: ${grant.amountMax}</li>}
          {grant.totalFunding && <li>Total Funding: ${grant.totalFunding}</li>}
          {grant.expectedAwards && (
            <li>Expected Awards: {grant.expectedAwards}</li>
          )}
        </ul>
      </section>

      {/* DATES */}
      <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="font-semibold text-xl text-slate-100 mb-4">Dates</h2>

        <ul className="space-y-2 text-slate-300 text-sm">
          {grant.openDate && (
            <li>Open Date: {new Date(grant.openDate).toLocaleDateString()}</li>
          )}
          {grant.postedDate && (
            <li>Posted Date: {new Date(grant.postedDate).toLocaleDateString()}</li>
          )}
          {grant.updatedAt && (
            <li>Last Updated: {new Date(grant.updatedAt).toLocaleDateString()}</li>
          )}
        </ul>
      </section>

      {/* FOUNDATION / PHILANTHROPIC */}
      {(grant.foundationName ||
        grant.foundationMission ||
        grant.philanthropicType) && (
        <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="font-semibold text-xl text-slate-100 mb-4">
            Foundation / Philanthropic
          </h2>

          <ul className="space-y-2 text-slate-300 text-sm">
            {grant.foundationName && <li>Name: {grant.foundationName}</li>}
            {grant.foundationMission && (
              <li>Mission: {grant.foundationMission}</li>
            )}
            {grant.philanthropicType && (
              <li>Type: {grant.philanthropicType}</li>
            )}
            {grant.philanthropicFocus && (
              <li>Focus: {grant.philanthropicFocus}</li>
            )}
          </ul>
        </section>
      )}

      {/* AI SCORES */}
      <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="font-semibold text-xl text-slate-100 mb-4">AI Scores</h2>

        <ul className="ml-4 list-disc text-slate-300 text-sm">
          <li>Eligibility: {grant.aiEligibilityScore ?? "N/A"}</li>
          <li>Alignment: {grant.aiAlignmentScore ?? "N/A"}</li>
          <li>Competitiveness: {grant.aiCompetitivenessScore ?? "N/A"}</li>
          <li>Risk: {grant.aiRiskScore ?? "N/A"}</li>
          <li>Readiness: {grant.aiReadinessScore ?? "N/A"}</li>
        </ul>

        {grant.aiSummary && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-slate-100 mb-1">
              AI Summary
            </h3>
            <p className="text-slate-300 text-sm whitespace-pre-line">
              {grant.aiSummary}
            </p>
          </div>
        )}
      </section>

      {/* DESCRIPTION */}
      {grant.description && (
        <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="font-semibold text-xl text-slate-100 mb-4">
            Description
          </h2>
          <p className="text-slate-300 whitespace-pre-line text-sm leading-relaxed">
            {grant.description}
          </p>
        </section>
      )}
    </div>
  );
}
