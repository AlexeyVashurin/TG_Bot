import express from "express";
import cors from "cors";
import { Bot } from "grammy";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const bot = new Bot('8174137007:AAHx6VN6S6tedtHQuV8lYqiw_6y6A4FguwU'); // Замените на ваш токен

// Эндпоинт для генерации ссылки на оплату
app.post("/generate-invoice", async (req, res) => {
  const title = "Test Product";
  const description = "Test description";
  const payload = "{}"; // Здесь можно передать идентификатор заказа или другую полезную информацию
  const currency = "XTR";
  const prices = [{ amount: 1, label: "Test Product" }];

  try {
    const invoiceLink = await bot.api.createInvoiceLink(
        title,
        description,
        payload,
        "", // Provider token должен быть пустым для Telegram Stars
        currency,
        prices,
    );
    res.json({ invoiceLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при генерации ссылки на оплату" });
  }
});

// Обработка pre_checkout_query — событие, которое приходит перед оплатой
bot.on("pre_checkout_query", async (ctx) => {
  try {
    // Здесь можно выполнить дополнительную проверку (например, сверку данных заказа)
    await ctx.answerPreCheckoutQuery(true); // Подтверждаем запрос
    console.log(`Pre-checkout query принята для пользователя ${ctx.from.id}`);
  } catch (err) {
    console.error("Ошибка в pre_checkout_query:", err);
    // Если что-то не так, можно отклонить запрос, указав причину:
    await ctx.answerPreCheckoutQuery(false, "Ошибка при проверке данных заказа");
  }
});

// Обработка успешного платежа
bot.on("message:successful_payment", async (ctx) => {
  try {
    const payment = ctx.message.successful_payment;
    console.log(`Пользователь ${ctx.from.id} успешно оплатил ${payment.total_amount} ${payment.currency}`);

    // Здесь можно добавить логику обработки:
    // - Обновить статус заказа в базе данных
    // - Отправить уведомление пользователю (например, через ctx.reply)
    // - Выдать доступ к купленному продукту или услуге и т.д.

    await ctx.reply("Спасибо за покупку! Ваш заказ обрабатывается.");
  } catch (err) {
    console.error("Ошибка при обработке успешного платежа:", err);
  }
});


bot.command("refund", (ctx) => {
  const userId = ctx.from.id;
  if (!paidUsers.has(userId)) {
    return ctx.reply("You have not paid yet, there is nothing to refund");
  }

  ctx.api
      .refundStarPayment(userId, paidUsers.get(userId))
      .then(() => {
        paidUsers.delete(userId);
        return ctx.reply("Refund successful");
      })
      .catch(() => ctx.reply("Refund failed"));
});

// Запуск бота в режиме polling
bot.start();

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
