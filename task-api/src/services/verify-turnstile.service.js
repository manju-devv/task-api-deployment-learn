const TURNSTILE_VERIFY_URL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token) {
    if (
        typeof token !== "string" ||
        !token.trim() ||
        !process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
    ) {
        return false;
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
            response: token,
        }),
    });

    if (!response.ok) {
        throw new Error("Cloudflare CAPTCHA verification service failed.");
    }

    const result = await response.json();
    return result.success === true;
}