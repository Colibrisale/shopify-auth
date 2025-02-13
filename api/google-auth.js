import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Missing Google token" });
    }

    try {
        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const googleUser = await googleResponse.json();

        if (googleUser.error) {
            return res.status(400).json({ success: false, message: "Invalid Google token", error: googleUser.error });
        }

        // Проверяем, есть ли пользователь в Shopify
        const shopifyResponse = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2023-10/customers/search.json?query=email:${googleUser.email}`, {
            method: "GET",
            headers: {
                "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
                "Content-Type": "application/json"
            }
        });

        const shopifyData = await shopifyResponse.json();
        let shopifyCustomerId = null;

        if (shopifyData.customers.length === 0) {
            // Если аккаунта нет, создаем нового клиента
            const createCustomerResponse = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2023-10/customers.json`, {
                method: "POST",
                headers: {
                    "X-Shopify-Access-Token": process.env.SHOPIFY_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer: {
                        first_name: googleUser.given_name,
                        last_name: googleUser.family_name,
                        email: googleUser.email,
                        verified_email: true
                    }
                })
            });

            const newCustomer = await createCustomerResponse.json();
            if (newCustomer.customer && newCustomer.customer.id) {
                shopifyCustomerId = newCustomer.customer.id;
            }
        } else {
            shopifyCustomerId = shopifyData.customers[0].id;
        }

        return res.status(200).json({ success: true, user: { ...googleUser, shopify_customer_id: shopifyCustomerId } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}
