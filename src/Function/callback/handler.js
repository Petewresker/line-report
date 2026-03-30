import { getCasesByUserService } from "./service.js";
import { replyLine } from "./line.js";

const LIFF_URL = process.env.LIFF_URL;
const AGENCY_WEB_LIFF_URL = process.env.AGENCY_WEB_LIFF_URL ?? "https://example.com";
const AGENCY_REGISTER_LIFF_URL = process.env.AGENCY_REGISTER_LIFF_URL ?? "https://example.com";

const STATUS_LABEL = {
  PENDING:     { text: "สถานะ : รอดำเนินการ",      color: "#F29A4E" },
  FORWARD:     { text: "สถานะ : กำลังส่งมอบ",       color: "#9B59B6" },
  IN_PROGRESS: { text: "สถานะ : กำลังดำเนินการ",    color: "#008000" },
  FINISHED:    { text: "สถานะ : แก้ไขสำเร็จแล้ว",   color: "#10B981" },
};

export async function handleSendReport(replyToken) {
  await replyLine(replyToken, [
    {
      type: "flex",
      altText: "แจ้งเหตุ — กดเพื่อเปิดฟอร์ม",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://incident-line-tu.s3.us-east-1.amazonaws.com/Group+168.png",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "แจ้งเหตุการณ์", weight: "bold", size: "xl" },
            { type: "text", text: "กรุณากดปุ่มด้านล่างเพื่อแจ้งเหตุ" },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          flex: 0,
          contents: [
            {
              type: "button",
              style: "link",
              height: "sm",
              action: { type: "uri", label: "เปิดฟอร์มแจ้งเหตุ", uri: LIFF_URL },
            },
            { type: "box", layout: "vertical", contents: [], margin: "sm" },
          ],
        },
      },
    },
  ]);
}

export async function handleAgencyInfo(replyToken) {
  await replyLine(replyToken, [
    {
      type: "flex",
      altText: "สำหรับเจ้าหน้าที่",
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: "https://incident-line-tu.s3.us-east-1.amazonaws.com/Group+174.png",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: "สำหรับเจ้าหน้าที่", weight: "bold", size: "xl" },
            {
              type: "text",
              text: "สำหรับเจ้าหน้าที่จากหน่วยงานใดๆสามารถใช้ฟังก์ชันของเราได้เลยย",
              wrap: true,
              size: "sm",
              color: "#888888",
              margin: "sm",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          flex: 0,
          contents: [
            {
              type: "button",
              style: "primary",
              height: "sm",
              action: { type: "uri", label: "ใช้งาน Problem Seeker", uri:"https://liff.line.me/2009444975-NsMS2WyX" },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: { type: "uri", label: "สมัครเจ้าหน้าที่", uri: "https://liff.line.me/2009444975-IEqeITxK" },
            },
          ],
        },
      },
    },
  ]);
}

export async function handleListCases(replyToken, userId) {
  const cases = await getCasesByUserService(userId);

  if (!cases || cases.length === 0) {
    await replyLine(replyToken, [
      { type: "text", text: "ยังไม่มีรายการแจ้งเหตุของคุณ" },
    ]);
    return;
  }

  const limited = cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const bubbles = limited.map((c, i) => buildCaseBubble(c, i + 1));

  await replyLine(replyToken, [
    {
      type: "flex",
      altText: `รายการแจ้งเหตุของคุณ (${limited.length} รายการ)`,
      contents: { type: "carousel", contents: bubbles },
    },
  ]);
}

function buildCaseBubble(c) {
  const status = STATUS_LABEL[c.status] ?? { text: c.status, color: "#888888" };
  const isFinished = c.status === "FINISHED";
  const heroUrl = (isFinished && c.imageUrlAfter) ? c.imageUrlAfter
    : c.imageUrl || "https://incident-line-tu.s3.us-east-1.amazonaws.com/cases/case_1.jpg";

  const bodyContents = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: c.title ?? "-", style: "italic", weight: "bold", decoration: "underline", wrap: true },
      ],
    },
    { type: "text", text: c.description ?? "-", size: "md", wrap: true },
  ];

  if (isFinished && c.Summary) {
    bodyContents.push({ type: "separator", margin: "md" });
    bodyContents.push({
      type: "box", layout: "vertical", margin: "md",
      contents: [
        { type: "text", text: "สรุปการดำเนินงาน", size: "xs", color: "#10B981", weight: "bold" },
        { type: "text", text: c.Summary, size: "sm", color: "#333333", wrap: true, margin: "xs" },
      ],
    });
  }

  return {
    type: "bubble",
    hero: {
      type: "image",
      url: heroUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: bodyContents,
    },
    footer: {
      type: "box", layout: "vertical", spacing: "sm", flex: 0,
      contents: [
        {
          type: "button",
          style: isFinished ? "primary" : "link",
          color: isFinished ? "#10B981" : undefined,
          height: "sm",
          action: { type: "uri", label: status.text, uri: LIFF_URL },
        },
      ],
    },
  };
}
