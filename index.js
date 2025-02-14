import express from "express";
import cors from "cors";
import { Bot } from "grammy";

const app = express();
const port = 3000;

// Разрешаем CORS для всех запросов (можно настроить более конкретно)
app.use(cors());
app.use(express.json());

const bot = new Bot('8174137007:AAHx6VN6S6tedtHQuV8lYqiw_6y6A4FguwU'); // Your bot token

app.post("/generate-invoice", async (req, res) => {
  const title = "Test Product";
  const description = "Test description";
  const payload = "{}";
  const currency = "XTR";
  const prices = [{ amount: 1, label: "Test Product" }];

  try {
    const invoiceLink = await bot.api.createInvoiceLink(
      title,
      description,
      payload,
      "", // Provider token must be empty for Telegram Stars
      currency,
      prices,
    );
    res.json({ invoiceLink });
  } catch (err) {
    res.status(500).json({ error: "Error generating invoice" });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
