export const PAYMENT_URL = "https://api-checkout.cinetpay.com/v2/payment";

export const cinet_Config = {};

// generate TOKEN CINETPAY
export async function getTokenCinetPay(): Promise<string> {
  const params = new URLSearchParams();
  params.append("apikey", process.env.CINET_PAY_API_KEY!);
  params.append("password", process.env.CINET_PAY_API_PASSWORD!);

  const response = await fetch("https://client.cinetpay.com/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Erreur auth CinetPay: ${data.message}`);
  }

  return data.data.token;
}
