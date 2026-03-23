"use client";

import { useState } from "react";

export default function Hello() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "2rem" }}>
      <h1>Hello, React!</h1>
      <p>นี่คือ component ทดสอบ React เบื้องต้น</p>

      <div style={{ marginTop: "1.5rem" }}>
        <p>คุณกดปุ่มแล้ว <strong>{count}</strong> ครั้ง</p>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: "0.5rem 1.5rem",
            fontSize: "1rem",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #0070f3",
            backgroundColor: "#0070f3",
            color: "#fff",
            marginRight: "0.5rem",
          }}
        >
          กดฉัน
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            padding: "0.5rem 1.5rem",
            fontSize: "1rem",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "#f5f5f5",
            color: "#333",
          }}
        >
          รีเซ็ต
        </button>
      </div>
    </div>
  );
}
