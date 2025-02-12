import express from "express";
import dotenv from "dotenv";
import authHandler from "./api/auth.js"; // Подключаем обработчик авторизации

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Добавляем поддержку JSON

app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

// Добавляем маршрут для обработки POST /api/auth
app.post("/api/auth", authHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
