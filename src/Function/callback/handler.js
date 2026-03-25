import { getCasesByUserId } from "./service.js";
import { replyLine } from "./line.js";

const LIFF_URL = process.env.LIFF_URL;

const STATUS_LABEL = {
  pending:     { text: "สถานะ : รอดำเนินการ",         color: "#F29A4E" },
  in_progress: { text: "สถานะ : กำลังดำเนินการแก้ไข", color: "#008000" },
  completed:   { text: "สถานะ : เสร็จสิ้น",            color: "#4A90D9" },
};

export async function handleSendReport(replyToken) {
  await replyLine(replyToken, [
    {
      type: "template",
      altText: "แจ้งเหตุ — กดเพื่อเปิดฟอร์ม",
      template: {
        type: "buttons",
        title: "แจ้งเหตุการณ์",
        text: "กดปุ่มด้านล่างเพื่อเปิดฟอร์มแจ้งเหตุ",
        actions: [{ type: "uri", label: "เปิดฟอร์มแจ้งเหตุ", uri: LIFF_URL }],
      },
    },
  ]);
}

export async function handleListCases(replyToken, userId) {
  const cases = await getCasesByUserId(userId);

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

function buildCaseBubble(c, index) {
  const status = STATUS_LABEL[c.status] ?? { text: c.status, color: "#888888" };

  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: c.imageUrl || "https://via.placeholder.com/400x300?text=No+Image",
      size: "full",
      aspectRatio: "4:3",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: c.description,
          weight: "bold",
          size: "sm",
          wrap: true,
          maxLines: 2,
        },
        {
          type: "box",
          layout: "vertical",
          flex: 0,
          width: "60px",
          backgroundColor: "#808080",
          cornerRadius: "md",
          paddingAll: "xs",
          contents: [
            {
              type: "text",
              text: c.topic ?? "อื่นๆ",
              size: "xs",
              color: "#FFFFFF",
              align: "center",
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: status.text,
          size: "sm",
          color: status.color,
          align: "center",
        },
        {
          type: "button",
          style: "link",
          height: "sm",
          color: "#4A90D9",
          action: {
            type: "message",
            label: "แก้ไข",
            text: `แก้ไขรายการ #${index}`,
          },
        },
      ],
    },
    styles: {
      footer: { separator: true, separatorColor: "#CCCCCC" },
    },
  };
}
