
import {
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";
import googleLogo from "./../assets/images/google.svg";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "", password: ""
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const turnstileRef = useRef(null);
    const widgetIdRef = useRef(null);

    const [turnstileToken, setTurnstileToken] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const googleButtonRef = useGoogleAuth(() => turnstileToken);


    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Validation Error", {
                description: "Please fill in all required fields"
            })
            return;
        }
        if (!turnstileToken) {
            toast.warning("Please complete the CAPTCHA verification.");
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                turnstileToken,
            };
            const response = await loginUser(payload);
            toast.success("Logged in successfully");
            login(response);
            setFormData({ email: "", password: "" });
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            setTurnstileToken("");
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!window.turnstile || !turnstileRef.current) return;
        widgetIdRef.current = window.turnstile.render(
            turnstileRef.current,
            {
                sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
                theme: "light",
                size: "normal",
                appearance: "always",
                execution: "render",
                callback: (token) => {
                    setTurnstileToken(token);
                },
                "expired-callback": () => {
                    setTurnstileToken("");
                },
                "error-callback": () => {
                    setTurnstileToken("");
                    toast.error("CAPTCHA verification failed. Please try again.");
                },
            }
        );
        return () => {
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }
        };
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F5F6FA] px-4 py-10">
            <div className="w-full max-w-md">

                <div className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-3">
                        <img
                            src="/todo.png"
                            alt="TodoNest logo"
                            className="h-11 w-11 object-contain"
                        />
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Todo<span className="text-indigo-600">Nest</span>
                        </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                        Your tasks, organized beautifully.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.06)] sm:p-8">
                    <div className="mb-7 cursor-pointer">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to continue to your account.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Email address
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    maxLength={254}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 ${errors.email
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>
                            </div>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    maxLength={128}
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                    className={`w-full rounded-xl border bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 ${errors.password
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"
                                        }`}
                                />

                                <button
                                    type="button"
                                    aria-label="Toggle password visibility"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {errors.password && (
                                <p id="password-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-start ">
                            <div ref={turnstileRef}></div>
                        </div>

                        {/* <button
                            type="submit"
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99] cursor-pointer"
                        >
                            Sign in
                            <ArrowRight
                                size={17}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </button> */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                            {!isSubmitting && (
                                <ArrowRight
                                    size={17}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            Or continue with email
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {/* <button
                        type="button"
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] cursor-pointer"
                    >
                        <img src={googleLogo} alt="Google" width="20" height="20" />
                        Continue with Google
                    </button> */}
                    <div
                        className="flex w-full justify-center"
                        ref={googleButtonRef}
                    />

                    <p className="mt-7 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <a
                            href="/signup"
                            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                            Create account
                        </a>
                    </p>
                </div>
                <p className="mt-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} TodoNest. All rights reserved.
                </p>
            </div>
        </main>
    );
}

export default Login;
