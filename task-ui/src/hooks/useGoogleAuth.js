
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { googleAuth } from "../api/auth";

export function useGoogleAuth(getTurnstileToken) {
    const googleButtonRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    useEffect(() => {
        const initializeGoogle = () => {
            if (!window.google?.accounts?.id || !googleButtonRef.current) {
                return;
            }
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    const turnstileToken = getTurnstileToken();
                    if (!turnstileToken) {
                        toast.error("Please complete CAPTCHA before signing in with Google.");
                        return;
                    }
                    try {
                        const result = await googleAuth(response.credential, turnstileToken);
                        login(result);
                        toast.success("Google authentication successful!");
                        navigate("/dashboard");
                    } catch (err) {
                        console.error("[Google Auth Error]", err);
                        toast.error(
                            err.response?.data?.message ||
                            err.message ||
                            "Google authentication failed"
                        );
                    }
                },
            });
            const buttonWidth = Math.floor(
                googleButtonRef.current.clientWidth
            );
            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                {
                    theme: "outline",
                    size: "large",
                    shape: "rectangular",
                    text: "continue_with",
                    width: buttonWidth,
                    logo_alignment: "center",
                }
            );
        };
        const script = document.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]'
        );
        if (window.google?.accounts?.id) {
            initializeGoogle();
        } else {
            script?.addEventListener("load", initializeGoogle);
        }
        return () => {
            script?.removeEventListener("load", initializeGoogle);
        };
    }, [GOOGLE_CLIENT_ID, login, navigate]);

    return googleButtonRef;
}
