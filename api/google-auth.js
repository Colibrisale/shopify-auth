export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ success: false, message: "Missing Google credential" });
    }

    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        const userData = await response.json();

        if (userData.error) {
            return res.status(400).json({ success: false, message: "Invalid Google token", error: userData.error });
        }

        return res.status(200).json({ success: true, user: userData });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}


