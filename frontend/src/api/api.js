import axios from "axios";

export const apiCall = async (url, method, options = {}) => {
    try {
        const res = await axios({
            url,
            method,
            withCredentials: true,
            ...options,
        });
        return res;
    } catch (error) {
        if (error.response?.status === 401) {
            // Try refreshing token
            try {
                const refreshTokenRes = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                console.log("l")

                if (refreshTokenRes.status === 200) {
                    // Retry original request
                    return await axios({
                        url,
                        method,
                        withCredentials: true,
                        ...options,
                    });
                }
            } catch (refreshErr) {
                throw refreshErr;
            }
        }

        // forward the error for all other cases
        throw error;
    }
};
