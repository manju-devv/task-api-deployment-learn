import { apiRequest } from "./client";
import { routes } from "./routes";

export function signupUser(body) {
    const route = routes.signUp;
    return apiRequest(route.url, {
        method: route.method,
        body: JSON.stringify(body)
    });
}


export function googleAuth(idToken, turnstileToken) {
    const route = routes.googleAuth;
    return apiRequest(route.url, {
        method: route.method,
        body: JSON.stringify({ idToken, turnstileToken })
    });
}

export function loginUser(body) {
    const route = routes.login;
    return apiRequest(route.url, {
        method: route.method,
        body: JSON.stringify(body)
    });
}

export function getCurrentUserDetails() {
    const route = routes.about;
    return apiRequest(route.url, {
        method: route.method
    });
}