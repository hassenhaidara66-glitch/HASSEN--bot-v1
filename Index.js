import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🤖 *Salam ! Je suis Hassen*, ton assistant islamique. Pose-moi une question sur le *Coran* ou les *Hadiths authentiques*. \n\nSi je ne sais pas, je dirai simplement : *Allahou A’lam* 🌙",
    { parse_mode: "Markdown" }
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMsg = msg.text;
  if (!userMsg || userMsg.startsWith("/start")) return;

  bot.sendChatAction(chatId, "typing");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Tu es Hassen, un assistant musulman respectueux. Réponds uniquement à partir du Coran et des hadiths authentiques. Si tu n’es pas sûr, dis 'Allahou A’lam'. Sois bienveillant et clair.",
        },
        { role: "user", content: userMsg },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content;
    await bot.sendMessage(chatId, answer, { parse_mode: "Markdown" });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "⚠️ Une erreur s’est produite. Réessaie plus tard incha’Allah.");
  }
});
