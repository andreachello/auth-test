const isProd = process.env.NODE_ENV === "production";
export const PORT = '4090'
export const API_BASE_URL = isProd ?
    `https://auth-test-production-7b33.up.railway.app/api/v1`
    // `https://auth-test-bbth.vercel.app/api/v1`
    : `http://localhost:${PORT}/api/v1`
