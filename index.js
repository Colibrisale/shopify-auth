import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authHandler from "./api/auth.js";
import googleAuthHandler from "./api/google-auth.js"; // ← Убедись, что этот импорт есть

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ["https://colibri.sale"], // Разрешаем запросы с твоего домена
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

// Главная страница проверки сервера
app.get("/", (req, res) => {
    res.send("Сервер работает!");
});

// Маршрут для Shopify авторизации
app.post("/api/auth", authHandler);

// Маршрут для Google авторизации
app.use("/api/google-auth", googleAuthHandler); // ← Вместо `app.post()`, нужно `app.use()`

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
