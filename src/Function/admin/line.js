const LINE_PUSH_API = "https://api.line.me/v2/bot/message/push";
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function pushLine(userId, messages) {
  const response = await fetch(LINE_PUSH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`LINE push failed: ${response.status} ${response.statusText} — ${errBody}`);
  }
}

export function createCaseFlexMessage(report, caseId, totalCount = 1, imageUrl = null) {
  const agencyLiffUrl = process.env.AGENCY_WEB_LIFF_URL ?? "https://line.me/"
  const countText = totalCount > 1 ? `${totalCount} เคสที่เกี่ยวข้อง` : `1 เคส`
  const location = (report.lat && report.lon) ? `${report.lat}, ${report.lon}` : "ไม่ระบุ"

  return {
    type: "flex",
    altText: `มีเคสใหม่ที่ต้องดำเนินการ: ${report.title}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#10B981",
        paddingAll: "md",
        contents: [
          { type: "text", text: "มีเคสใหม่ที่ต้องดำเนินการ", color: "#ffffff", size: "sm", weight: "bold" },
          { type: "text", text: countText, color: "#d1fae5", size: "xs", margin: "xs" },
        ],
      },
      ...(imageUrl ? {
        hero: {
          type: "image",
          url: imageUrl,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        },
      } : {}),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: report.title ?? "-", weight: "bold", size: "lg", wrap: true },
          { type: "text", text: report.description ?? "-", size: "sm", color: "#555555", wrap: true, margin: "sm" },
          {
            type: "box", layout: "baseline", margin: "md", spacing: "sm",
            contents: [
              { type: "text", text: "สถานที่", color: "#aaaaaa", size: "sm", flex: 2 },
              { type: "text", text: location, wrap: true, color: "#666666", size: "sm", flex: 5 },
            ],
          },
          {
            type: "box", layout: "baseline", spacing: "sm",
            contents: [
              { type: "text", text: "Case ID", color: "#aaaaaa", size: "sm", flex: 2 },
              { type: "text", text: caseId, wrap: true, color: "#666666", size: "sm", flex: 5 },
            ],
          },
        ],
      },
      footer: {
        type: "box", layout: "vertical", spacing: "sm", flex: 0,
        contents: [
          {
            type: "button", style: "primary", color: "#10B981", height: "sm",
            action: { type: "uri", label: "ดูรายละเอียดเคส", uri: agencyLiffUrl },
          },
        ],
      },
    },
  }
}
