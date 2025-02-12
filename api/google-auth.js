export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: "No token provided" });
    }

    try {
        // Отправляем токен Google для валидации
        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const userData = await googleResponse.json();

        if (userData.error) {
            return res.status(400).json({ success: false, message: "Invalid token" });
        }

        // Здесь можно сохранить данные пользователя в базу данных
        console.log("User Data:", userData);

        return res.status(200).json({ success: true, user: userData });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

