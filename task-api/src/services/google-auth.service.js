
import { OAuth2Client } from "google-auth-library";

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
}

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export async function verifyGoogleIdToken(idToken) {
    if (!idToken || typeof idToken !== "string") {
        throw new Error("Google ID token is required.");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
        throw new Error("Invalid Google account information.");
    }

    if (!payload.email_verified) {
        throw new Error("Google email address is not verified.");
    }

    return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name || payload.email.split("@")[0],
        profilePicture: payload.picture || null,
    };
}
