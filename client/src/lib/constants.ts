const isProd = process.env.NODE_ENV === "production";
export const PORT = '4090'
export const API_BASE_URL = isProd ?
    `http://localhost:${PORT}/api/v1`
    : `http://localhost:${PORT}/api/v1`
