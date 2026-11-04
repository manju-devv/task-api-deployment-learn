
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
                ...(token && {
                    Authorization: `Bearer ${token}`,
                }),
            },
        });
        const data = await response.json();
        if (!response.ok) {
            const error = new Error(data.message || "Something went wrong")
            // throw new Error(data.message || "Something went wrong");
            error.status = response.status;
            throw error;
        }
        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                "Unable to connect to the server. Please try again later."
            );
        }
        throw error;
    }
}
