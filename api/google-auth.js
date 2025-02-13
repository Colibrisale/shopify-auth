import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Missing Google credential" });
    }

    try {
        // Проверяем токен Google
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const userData = await response.json();

        if (userData.error) {
            return res.status(400).json({ success: false, message: "Invalid Google token", error: userData.error });
        }

        const userEmail = userData.email;
        const userName = userData.given_name;
        const userLastName = userData.family_name;

        // Проверяем, есть ли пользователь в Shopify
        const shopifyAPI = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2023-10/customers/search.json?query=email:${userEmail}`;
        const shopifyResponse = await fetch(shopifyAPI, {
            method: "GET",
            headers: {
                "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
                "Content-Type": "application/json"
            }
        });
        const shopifyData = await shopifyResponse.json();

        let customerId;
        if (shopifyData.customers && shopifyData.customers.length > 0) {
            // Пользователь найден
            customerId = shopifyData.customers[0].id;
        } else {
            // Если нет, создаём нового клиента
            const createCustomerResponse = await fetch(`https://${process.env.SHOPIFY_STORE_URL}/admin/api/2023-10/customers.json`, {
                method: "POST",
                headers: {
                    "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer: {
                        first_name: userName,
                        last_name: userLastName,
                        email: userEmail,
                        verified_email: true
                    }
                })
            });

            const createdCustomer = await createCustomerResponse.json();
            customerId = createdCustomer.customer.id;
        }

        // Отправляем данные пользователю
        return res.status(200).json({ success: true, user: { email: userEmail, first_name: userName, last_name: userLastName, id: customerId } });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
