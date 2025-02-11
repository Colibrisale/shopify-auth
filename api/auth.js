export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, first_name, last_name } = req.body;
  
  const shopifyAPIKey = "ТВОЙ_SHOPIFY_API_KEY";
  const shopifyPassword = "ТВОЙ_SHOPIFY_PASSWORD";
  const shopName = "ТВОЙ_SHOPIFY_МАГАЗИН";

  const shopifyCustomerUrl = `https://${shopName}.myshopify.com/admin/api/2023-10/customers.json?email=${email}`;

  const shopifyHeaders = {
    "Authorization": "Basic " + Buffer.from(`${shopifyAPIKey}:${shopifyPassword}`).toString("base64"),
    "Content-Type": "application/json"
  };

  try {
    const response = await fetch(shopifyCustomerUrl, { headers: shopifyHeaders });
    const data = await response.json();

    if (data.customers.length > 0) {
      return res.status(200).json({ success: true, message: "User found in Shopify" });
    }

    const createCustomerUrl = `https://${shopName}.myshopify.com/admin/api/2023-10/customers.json`;
    const newCustomerData = {
      customer: {
        first_name,
        last_name,
        email,
        verified_email: true
      }
    };

    const createResponse = await fetch(createCustomerUrl, {
      method: "POST",
      headers: shopifyHeaders,
      body: JSON.stringify(newCustomerData)
    });

    const createData = await createResponse.json();
    return res.status(200).json({ success: true, message: "User created", data: createData });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
