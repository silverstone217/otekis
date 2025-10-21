/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // firebsae api keys
    API_KEY: process.env.API_KEY,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    PROJECT_ID: process.env.PROJECT_ID,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
    APP_ID: process.env.APP_ID,

    // next-auth and db api keys
    SECRET_KEY: process.env.SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SITE_NAME: process.env.SITE_NAME,

    // GOOGLE API AUTH KEYS
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,

    // EMAIL SERVICES AND KEYS
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,

    // RESEND API KEY
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    // APPLE AUTH KEYS
    APPLE_ID: process.env.APPLE_ID,
    APPLE_KEY_SECRET: process.env.APPLE_KEY_SECRET,

    // cinetpay api keys
    CINET_PAY_API_KEY: process.env.CINET_PAY_API_KEY,
    CINET_PAY_SECRET_KEY: process.env.CINET_PAY_SECRET_KEY,
    CINET_PAY_SITE_ID: process.env.CINET_PAY_SITE_ID,
    // dollars
    CINET_PAY_SECRET_KEY_USD: process.env.CINET_PAY_SECRET_KEY_USD,
    CINET_PAY_SITE_ID_USD: process.env.CINET_PAY_SITE_ID_USD,
    // Franc congolais
    CINET_PAY_SECRET_KEY_CDF: process.env.CINET_PAY_SECRET_KEY_CDF,
    CINET_PAY_SITE_ID_CDF: process.env.CINET_PAY_SITE_ID_CDF,

    // pusher api keys
    PUSHER_APPID: process.env.PUSHER_APPID,
    PUSHER_KEY: process.env.PUSHER_KEY,
    PUSHER_SECRET: process.env.PUSHER_SECRET,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
  },
  images: {
    // domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "3eqaz12yan4rgf7v.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "3eqaz12yan4rgf7v.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
