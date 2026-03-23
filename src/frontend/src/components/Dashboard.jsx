"use client";

export default function Dashboard() {
  const stats = [
    { label: "รายงานทั้งหมด", value: "128" },
    { label: "รอดำเนินการ", value: "24" },
    { label: "เสร็จสิ้น", value: "98" },
    { label: "ยกเลิก", value: "6" },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "1.25rem",
              borderRadius: "8px",
              backgroundColor: "#f0f4ff",
              border: "1px solid #d0d9ff",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#0070f3" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#555", marginTop: "0.25rem" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: "1rem" }}>รายการล่าสุด</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>ชื่อรายงาน</th>
            <th style={thStyle}>วันที่</th>
            <th style={thStyle}>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 1, name: "รายงานประจำเดือน มี.ค.", date: "22/03/2026", status: "เสร็จสิ้น" },
            { id: 2, name: "รายงานยอดขาย Q1", date: "20/03/2026", status: "รอดำเนินการ" },
            { id: 3, name: "รายงานสรุปรายสัปดาห์", date: "18/03/2026", status: "เสร็จสิ้น" },
          ].map((row) => (
            <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>{row.id}</td>
              <td style={tdStyle}>{row.name}</td>
              <td style={tdStyle}>{row.date}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    backgroundColor: row.status === "เสร็จสิ้น" ? "#d1fae5" : "#fef9c3",
                    color: row.status === "เสร็จสิ้น" ? "#065f46" : "#854d0e",
                  }}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: "600",
  color: "#333",
};

const tdStyle = {
  padding: "0.75rem 1rem",
  color: "#444",
};
