const LINE_REPLY_API = "https://api.line.me/v2/bot/message/reply";
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function replyLine(replyToken, messages) {
  await fetch(LINE_REPLY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}
