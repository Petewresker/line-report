import { getCasesByUserService } from "./service.js";
import { replyLine } from "./line.js";

const LIFF_URL = process.env.LIFF_URL;
const AGENCY_WEB_LIFF_URL = process.env.AGENCY_WEB_LIFF_URL ?? "https://example.com";
const AGENCY_REGISTER_LIFF_URL = process.env.AGENCY_REGISTER_LIFF_URL ?? "https://example.com";

const STATUS_LABEL = {
  PENDING:     { text: "สถานะ : รอดำเนินการ",      color: "#F29A4E" },
  FORWARD:     { text: "สถานะ : กำลังส่งมอบ",       color: "#9B59B6" },
  IN_PROGRESS: { text: "สถานะ : กำลังดำเนินการ",    color: "#008000" },
  FINISHED:    { text: "สถานะ : แก้ไขสำเร็จแล้ว",   color: "#4A90D9" },
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
              action: { type: "uri", label: "ใช้งาน Problem Seeker", uri: "https://example.com" },
            },
            {
              type: "button",
              style: "link",
              height: "sm",
              action: { type: "uri", label: "สมัครเจ้าหน้าที่", uri: "https://example.com" },
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

  const bubbles = cases.map((c, i) => buildCaseBubble(c, i + 1));

  await replyLine(replyToken, [
    {
      type: "flex",
      altText: `รายการแจ้งเหตุของคุณ (${cases.length} รายการ)`,
      contents: { type: "carousel", contents: bubbles },
    },
  ]);
}

function buildCaseBubble(c) {
  const status = STATUS_LABEL[c.status] ?? { text: c.status, color: "#888888" };

  return {
    type: "bubble",
    hero: {
      type: "image",
      url: c.imageUrl || "https://via.placeholder.com/400x300?text=No+Image",
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: c.title ?? "-",
              style: "italic",
              weight: "bold",
              decoration: "underline",
              wrap: true,
            },
          ],
        },
        {
          type: "text",
          text: c.description ?? "-",
          size: "md",
          wrap: true,
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
          style: "link",
          height: "sm",
          action: {
            type: "uri",
            label: status.text,
            uri: LIFF_URL,
          },
        },
      ],
    },
  };
}
