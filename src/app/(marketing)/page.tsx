"use client";

import { useEffect, useState } from "react";
import { PLANS, getSeatLimitLabel, getAnnualMonthlyEquivalent } from "@/lib/plans";
import MarketingChatWidget from "@/components/marketing/MarketingChatWidget";

// Shared with the in-app workspace billing page (src/app/(workspace-group)/
// workspace/[workspaceId]/workspace-billing/page.tsx) - whichever cycle a
// visitor picks here is remembered so their billing toggle is already set
// to match once they sign up and reach the real checkout.
const BILLING_INTERVAL_STORAGE_KEY = "gsp-preferred-billing-interval";

export default function MarketingHomePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    try {
      window.localStorage.setItem(
        BILLING_INTERVAL_STORAGE_KEY,
        billing === "annual" ? "yearly" : "monthly"
      );
    } catch {
      // localStorage unavailable (private browsing, etc.) - display-only toggle still works.
    }
  }, [billing]);

  const getDisplayPrice = (monthlyPrice: number) => {
    if (billing === "annual") {
      return getAnnualMonthlyEquivalent(monthlyPrice).toString();
    }
    return monthlyPrice.toString();
  };

  const getBillingCaption = () =>
    billing === "annual" ? "/month, billed annually" : "/month";

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
 <a href="#features" style={{ color: "#CBD5E1", textDecoration: "none" }}>Features</a>
<a href="#pricing" style={{ color: "#CBD5E1", textDecoration: "none" }}>Pricing</a>
<a href="/about" style={{ color: "#CBD5E1", textDecoration: "none" }}>About</a>
<a
  href="https://calendly.com/dlbarnes-dbglobalinvestments/new-meeting-1"
  target="_blank"
  rel="noopener noreferrer"
  style={{ color: "#CBD5E1", textDecoration: "none" }}
>
  Contact
</a>
<a
  href="/sign-in"
  style={{
    color: "#CBD5E1",
    textDecoration: "none",
  }}
>
  Log In
</a>
<a
  href="/sign-up"
  style={{
    color: "#CBD5E1",
    textDecoration: "none",
  }}
>
  Create Account
</a>


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
          <a
  href="/sign-up"
  style={{
    background: "#F5C542",
    color: "#071633",
    border: "none",
    borderRadius: "12px",
    padding: "16px 28px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  }}
>
  Start Free Trial
</a>

         <a
  href="https://calendly.com/dlbarnes-dbglobalinvestments/new-meeting-1"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,.2)",
    borderRadius: "12px",
    padding: "16px 28px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  }}
>
  Book Demo
</a>
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

     {/* FEATURES */}

      <div
        id="features"
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
                {/* PRICING */}

      <div
        id="pricing"
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
            Simple Pricing
          </h2>

          <p
            style={{
              fontSize: "22px",
              color: "#CBD5E1",
              marginBottom: "32px",
            }}
          >
            Choose the funding universe you want access to.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: billing === "monthly" ? "#FFFFFF" : "#94A3B8",
              }}
            >
              Monthly
            </span>

            <button
              type="button"
              onClick={() =>
                setBilling(billing === "monthly" ? "annual" : "monthly")
              }
              aria-pressed={billing === "annual"}
              aria-label="Toggle annual billing"
              style={{
                width: "56px",
                height: "30px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                position: "relative",
                background:
                  billing === "annual" ? "#F5C542" : "rgba(255,255,255,.15)",
                transition: "background 0.2s ease",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: billing === "annual" ? "29px" : "3px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#071633",
                  transition: "left 0.2s ease",
                }}
              />
            </button>

            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                color: billing === "annual" ? "#FFFFFF" : "#94A3B8",
              }}
            >
              Annual
              <span
                style={{
                  background: "#F5C542",
                  color: "#071633",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "2px 10px",
                  borderRadius: "999px",
                }}
              >
                Save 15%
              </span>
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
        >
          {/* BASIC */}

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "35px",
            }}
          >
            <h3>Basic</h3>

            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              ${getDisplayPrice(29)}
            </div>

            <p>{getBillingCaption()}</p>

            <p
              style={{
                color: "#CBD5E1",
                fontWeight: 700,
              }}
            >
              Federal Grant Search
            </p>

            <p
              style={{
                color: "#F5C542",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {getSeatLimitLabel(PLANS.basic)}
            </p>

            <p>✓ Federal Opportunities</p>
            <p>✓ Grant Match Scoring</p>
            <p>✓ Proposal Templates</p>
            <p>✓ Basic Workspace</p>
            <a
  href="/sign-up"
  style={{
    display: "inline-block",
    marginTop: "20px",
    background: "#F5C542",
    color: "#071633",
    padding: "12px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 700,
  }}
>
  Start Basic
</a>
          </div>

          {/* TEAM */}

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "35px",
            }}
          >
            <h3>Team</h3>

            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              ${getDisplayPrice(49)}
            </div>

            <p>{getBillingCaption()}</p>

            <p
              style={{
                color: "#CBD5E1",
                fontWeight: 700,
              }}
            >
              Federal + State Grant Search
            </p>

            <p
              style={{
                color: "#F5C542",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {getSeatLimitLabel(PLANS.team)}
            </p>

            <p>✓ Everything in Basic</p>
            <p>✓ State Opportunities</p>
            <p>✓ AI Proposal Writer</p>
            <p>✓ Team Collaboration</p>
            <p>✓ Shared Workspaces</p>
            <a
  href="/sign-up"
  style={{
    background: "#F5C542",
    color: "#071633",
    borderRadius: "12px",
    padding: "14px 24px",
    textDecoration: "none",
    display: "inline-block",
    fontWeight: 700,
    marginTop: "20px",
  }}
>
  Start Team
</a>
          </div>

          {/* BUSINESS */}

          <div
            style={{
              background: "#10254D",
              border: "2px solid #F5C542",
              borderRadius: "20px",
              padding: "35px",
              transform: "scale(1.03)",
            }}
          >
            <div
              style={{
                color: "#F5C542",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              MOST POPULAR
            </div>

            <h3>Business</h3>

            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              ${getDisplayPrice(99)}
            </div>

            <p>{getBillingCaption()}</p>

            <p
              style={{
                color: "#CBD5E1",
                fontWeight: 700,
              }}
            >
              Federal + State + Foundation Search
            </p>

            <p
              style={{
                color: "#F5C542",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {getSeatLimitLabel(PLANS.business)}
            </p>

            <p>✓ Everything in Team</p>
            <p>✓ Private Foundation Search</p>
            <p>✓ AI Proposal Writer</p>
            <p>✓ GrantScout CRM <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "13px" }}>(Coming Soon)</span></p>
            <p>✓ Submission Tracking</p>
            <p>✓ Advanced Reporting</p>
            <a
  href="/sign-up"
  style={{
    background: "#F5C542",
    color: "#071633",
    borderRadius: "12px",
    padding: "14px 24px",
    textDecoration: "none",
    display: "inline-block",
    fontWeight: 700,
    marginTop: "20px",
  }}
>
  Start Free Trial
</a>

          </div>

          {/* ENTERPRISE */}

          <div
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px",
              padding: "35px",
            }}
          >
            <h3>Enterprise</h3>

            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#F5C542",
              }}
            >
              Custom
            </div>

            <p>Contact Sales</p>

            <p
              style={{
                color: "#CBD5E1",
                fontWeight: 700,
              }}
            >
              Complete Grant Operations Platform
            </p>

            <p
              style={{
                color: "#F5C542",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {getSeatLimitLabel(PLANS.enterprise)}
            </p>

            <p>✓ Everything in Business</p>
            <p>✓ Unlimited Users</p>
            <p>✓ GrantScout CRM <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "13px" }}>(Coming Soon)</span></p>
            <p>✓ API Access</p>
            <p>✓ Custom Integrations</p>
            <p>✓ Dedicated Success Manager</p>
            <a
  href="https://calendly.com/dlbarnes-dbglobalinvestments/new-meeting-1"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    background: "#F5C542",
    color: "#071633",
    borderRadius: "12px",
    padding: "14px 24px",
    textDecoration: "none",
    display: "inline-block",
    fontWeight: 700,
    marginTop: "20px",
  }}
>
  Contact Sales
</a>
          </div>
        </div>

      </div>
            {/* FINAL CTA */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 60px 120px",
        }}
      >
        <div
          style={{
            background: "#10254D",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "28px",
            padding: "80px 60px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "56px",
              fontWeight: 800,
              marginBottom: "20px",
            }}
          >
            Ready to Win More Grant Funding?
          </h2>

          <p
            style={{
              color: "#CBD5E1",
              fontSize: "24px",
              maxWidth: "800px",
              margin: "0 auto 40px",
            }}
          >
            Find opportunities faster, write stronger
            proposals, and manage every grant
            application in one AI-powered platform.
          </p>

          <div
            style={{
              color: "#F5C542",
              fontWeight: 700,
              marginBottom: "30px",
            }}
          >
            Annual Plans Save 15%
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <a
  href="/sign-up"
  style={{
    background: "#F5C542",
    color: "#071633",
    border: "none",
    borderRadius: "12px",
    padding: "18px 32px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  }}
>
  Start Free Trial
</a>

            <a
  href="https://calendly.com/dlbarnes-dbglobalinvestments/new-meeting-1"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    background: "transparent",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,.25)",
    borderRadius: "12px",
    padding: "18px 32px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  }}
>
  Schedule Demo
</a>
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,.08)",
          padding: "40px 60px",
          color: "#CBD5E1",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "24px",
                marginBottom: "10px",
              }}
            >
              GrantScout Pro
            </div>

            <div>
              The operating system for grant funding.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
            }}
          >
            <a href="#features" style={{ color: "#CBD5E1", textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ color: "#CBD5E1", textDecoration: "none" }}>Pricing</a>
            <a href="/integrations" style={{ color: "#CBD5E1", textDecoration: "none" }}>Integrations</a>
            <a
              href="https://calendly.com/dlbarnes-dbglobalinvestments/new-meeting-1"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#CBD5E1", textDecoration: "none" }}
            >
              Contact
            </a>
            <a href="/privacy" style={{ color: "#CBD5E1", textDecoration: "none" }}>Privacy</a>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          © 2026 GrantScout Pro. All rights reserved.
        </div>
      </footer>

      <MarketingChatWidget />
    </div>
  );
}

          