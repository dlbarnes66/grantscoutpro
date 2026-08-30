"use client";

export default function MarketingHomePage() {
  return (
    <div
      style={{
        background: "#071633",
        color: "white",
        minHeight: "100vh",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      {/* NAVBAR */}

      <div
        style={{
          padding: "24px 60px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
          }}
        >
          GrantScout Pro
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            color: "#CBD5E1",
          }}
        >
          <span>Features</span>
          <span>Pricing</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </div>

      {/* HERO */}

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "100px 60px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: "999px",
            background: "rgba(245,197,66,.12)",
            color: "#F5C542",
            marginBottom: "30px",
          }}
        >
          AI-Powered Grant Intelligence
        </div>

        <h1
          style={{
            fontSize: "72px",
            lineHeight: 1,
            fontWeight: 800,
            maxWidth: "700px",
            margin: 0,
          }}
        >
          The operating
          <br />
          system for
          <br />
          grant funding.
        </h1>

        <p
          style={{
            fontSize: "28px",
            color: "#CBD5E1",
            maxWidth: "760px",
            marginTop: "30px",
          }}
        >
          Search opportunities, write proposals,
          collaborate with your team, and manage
          the entire grant lifecycle in a single
          AI-powered workspace.
        </p>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "16px",
          }}
        >
          <button
            style={{
              background: "#F5C542",
              color: "#071633",
              border: "none",
              borderRadius: "12px",
              padding: "16px 28px",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Start Free Trial
          </button>

          <button
            style={{
              background: "transparent",
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: "12px",
              padding: "16px 28px",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Book Demo
          </button>
        </div>
      </div>

      {/* PLATFORM PREVIEW */}

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 60px 120px",
        }}
      >
        <div
          style={{
            background: "#10254D",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,.45)",
          }}
        >
          <div
            style={{
              height: "64px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
              }}
            >
              GrantScout Pro Workspace
            </div>

            <div
              style={{
                color: "#F5C542",
                fontWeight: 700,
              }}
            >
              AI Match Score: 96%
            </div>
          </div>

          <div
            style={{
              padding: "40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "24px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,.04)",
                padding: "24px",
                borderRadius: "16px",
              }}
            >
              <h3>Recommended Grants</h3>

              <p>STEM Innovation Fund</p>
              <p>Community Impact Grant</p>
              <p>Youth Development Award</p>
              <p>Workforce Expansion Fund</p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,.04)",
                padding: "24px",
                borderRadius: "16px",
              }}
            >
              <h3>Proposal Progress</h3>

              <p>Needs Statement - 90%</p>
              <p>Project Narrative - 78%</p>
              <p>Budget Justification - 65%</p>
              <p>Attachments - 100%</p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,.04)",
                padding: "24px",
                borderRadius: "16px",
              }}
            >
              <h3>Activity Feed</h3>

              <p>✓ AI generated proposal draft</p>
              <p>✓ Budget approved</p>
              <p>✓ Narrative reviewed</p>
              <p>✓ Submission scheduled</p>
              <p>✓ Compliance check complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}