import express from "express";
import dotenv from "dotenv";
import authHandler from "./api/auth.js"; // Подключаем обработчик авторизации
import googleAuthHandler from "./api/google-auth.js"; // Подключаем обработчик Google Auth

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Поддержка JSON

app.get("/", (req, res) => {
    res.send("Сервер работает!");
});

// Добавляем этот маршрут для POST-запросов
app.post("/api/auth", authHandler);
app.post("/api/google-auth", googleAuthHandler); // Добавляем Google Auth

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
