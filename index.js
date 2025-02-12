import express from "express";
import dotenv from "dotenv";
import authHandler from "./api/auth.js"; // Подключаем обработчик авторизации
import googleAuthHandler from "./api/google-auth.js"; // Подключаем обработчик Google авторизации

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Поддержка JSON

// Главная страница проверки сервера
app.get("/", (req, res) => {
    res.send("Сервер работает!");
});

// Маршрут для Shopify авторизации
app.post("/api/auth", authHandler);

// Маршрут для Google авторизации
app.post("/api/google-auth", googleAuthHandler);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

