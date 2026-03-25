import { handleSendReport, handleListCases } from "./handler.js";

export const handler = async (event) => {
  console.log(JSON.stringify(event, undefined, 2));

  const body = JSON.parse(event.body || "{}");

  for (const ev of body.events || []) {
    if (ev.type !== "message" || ev.message.type !== "text") continue;

    const text = ev.message.text.trim();
    const userId = ev.source.userId;
    const replyToken = ev.replyToken;

    if (text === "ส่งแจ้งเหตุ") {
      await handleSendReport(replyToken);
    } else if (text === "รายการแจ้งเหตุ") {
      await handleListCases(replyToken, userId);
    }
  }

  return { statusCode: 200, body: "OK" };
};
