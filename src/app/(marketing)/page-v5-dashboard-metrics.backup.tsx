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
            fontSize: "88px",
            lineHeight: 1,
            fontWeight: 800,
            maxWidth: "900px",
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
              Grant Match Score: 96%
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

      {/* METRICS */}

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 60px 120px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              15,000+
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#CBD5E1",
              }}
            >
              Funding Opportunities
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              96%
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#CBD5E1",
              }}
            >
              Grant Match Accuracy
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              50+
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#CBD5E1",
              }}
            >
              Proposal Templates
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              24/7
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#CBD5E1",
              }}
            >
              AI Grant Intelligence
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
      {/* FEATURES */}

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 60px 120px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
          }}
        >
          <h2
            style={{
              fontSize: "48px",
              fontWeight: 800,
              marginBottom: "20px",
            }}
          >
            Everything Your Grant Team Needs
          </h2>

          <p
            style={{
              color: "#CBD5E1",
              fontSize: "22px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            From discovery to submission, manage the
            entire grant lifecycle inside a single
            AI-powered workspace.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h3>AI Grant Search</h3>

            <p style={{ color: "#CBD5E1" }}>
              Discover funding opportunities that
              match your mission and programs.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h3>Proposal Generation</h3>

            <p style={{ color: "#CBD5E1" }}>
              Create narratives, budgets, and
              supporting documents in minutes.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h3>Team Collaboration</h3>

            <p style={{ color: "#CBD5E1" }}>
              Review, comment, approve, and work
              together in real time.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h3>Submission Tracking</h3>

            <p style={{ color: "#CBD5E1" }}>
              Monitor deadlines, submissions,
              awards, and follow-ups.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h3>Grant Match Scoring</h3>

            <p style={{ color: "#CBD5E1" }}>
              Prioritize the opportunities with the
              highest likelihood of success.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h3>Reporting & Compliance</h3>

            <p style={{ color: "#CBD5E1" }}>
              Track outcomes, requirements, and
              compliance reporting in one place.
            </p>
          </div>
        </div>
      </div>