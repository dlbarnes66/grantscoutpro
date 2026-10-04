"use client";

import { useEffect, useState } from "react";
import { PLANS, getSeatLimitLabel, getAnnualMonthlyEquivalent } from "@/lib/plans";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

// Shared with the in-app workspace billing page (src/app/(workspace-group)/
// workspace/[workspaceId]/workspace-billing/page.tsx) - whichever cycle a
// visitor picks here is remembered so their billing toggle is already set
// to match once they sign up and reach the real checkout.
const BILLING_INTERVAL_STORAGE_KEY = "gsp-preferred-billing-interval";

// The pricing cards themselves - shared between the homepage's #pricing
// anchor section and the dedicated /pricing page, so there is exactly one
// place that can drift from src/lib/plans.ts instead of two.
export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const isMobile = useIsMobile();

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
        id="pricing"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: isMobile ? "0 20px 60px" : "0 60px 120px",
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
              fontSize: isMobile ? "30px" : "48px",
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
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
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
                fontSize: isMobile ? "32px" : "52px",
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
                fontSize: isMobile ? "32px" : "52px",
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
                fontSize: isMobile ? "32px" : "52px",
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
            <p>✓ Grant Scout CRM <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "13px" }}>(Coming Soon)</span></p>
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
                fontSize: isMobile ? "32px" : "52px",
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
            <p>✓ Grant Scout CRM <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: "13px" }}>(Coming Soon)</span></p>
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
  );
}
