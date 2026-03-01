"use client";

export default function HomeClient() {
  const go = () => {
    window.location.assign("https://kinderai.vercel.app/chat");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "white", background: "#020617" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 48, margin: 0 }}>HumanKindAI</h1>
        <p style={{ opacity: 0.7 }}>Landing → opens KinderAI chat</p>
        <button
          onClick={go}
          style={{
            marginTop: 16,
            padding: "12px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Try KinderAI
        </button>
      </div>
    </div>
  );
}