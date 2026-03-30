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
    const errBody = await response.text();
    throw new Error(`LINE push failed: ${response.status} ${response.statusText} — ${errBody}`);
  }
}

export function createCompletionFlexMessage(caseData, imageAfterUrl) {
  const liffUrl = process.env.LIFF_URL ?? "https://line.me/";

  const bodyContents = [
    { type: "text", text: caseData.title ?? "-", weight: "bold", size: "lg", wrap: true },
    { type: "text", text: caseData.description ?? "-", size: "sm", color: "#555555", wrap: true, margin: "sm" },
    { type: "separator", margin: "md" },
    {
      type: "box", layout: "vertical", margin: "md",
      contents: [
        { type: "text", text: "สรุปการดำเนินงาน", size: "xs", color: "#10B981", weight: "bold" },
        { type: "text", text: caseData.Summary ?? "-", size: "sm", color: "#333333", wrap: true, margin: "xs" },
      ],
    },
  ];

  return {
    type: "flex",
    altText: `งานของคุณเสร็จแล้ว: ${caseData.title}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#10B981",
        paddingAll: "md",
        contents: [
          { type: "text", text: "งานเสร็จแล้ว!", color: "#ffffff", size: "md", weight: "bold" },
          { type: "text", text: "ทีมงานได้แก้ไขปัญหาของคุณเรียบร้อยแล้ว", color: "#d1fae5", size: "xs", margin: "xs", wrap: true },
        ],
      },
      ...(imageAfterUrl ? {
        hero: {
          type: "image",
          url: imageAfterUrl,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        },
      } : {}),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: bodyContents,
      },
      footer: {
        type: "box", layout: "vertical", spacing: "sm", flex: 0,
        contents: [
          {
            type: "button", style: "primary", color: "#10B981", height: "sm",
            action: { type: "uri", label: "ดูรายการแจ้งเหตุ", uri: liffUrl },
          },
        ],
      },
    },
  };
}
