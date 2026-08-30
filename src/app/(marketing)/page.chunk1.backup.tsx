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
    </div>
  );
}
  