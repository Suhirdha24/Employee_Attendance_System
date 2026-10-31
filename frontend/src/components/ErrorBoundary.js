import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("StaffTrack Error caught:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8fafc",
            padding: "24px",
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "36px 32px",
              boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                margin: "0 auto 16px",
                border: "1px solid #fecaca",
              }}
            >
              ⚠️
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
              Something Went Wrong
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>
              The page ran into an unexpected issue. Please click Reload to refresh the screen, or reset your session cache if the issue persists.
            </p>

            {this.state.error && (
              <div
                style={{
                  textAlign: "left",
                  background: "#f1f5f9",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#334155",
                  overflowX: "auto",
                  marginBottom: "24px",
                  border: "1px solid #cbd5e1",
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#4338ca",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

