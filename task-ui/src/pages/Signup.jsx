
import { useState, useEffect, useRef } from "react";
import {
    UserRound,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import googleLogo from "./../assets/images/google.svg";
import { signupUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const turnstileRef = useRef(null);
    const widgetIdRef = useRef(null);

    const [turnstileToken, setTurnstileToken] = useState("");
    const turnstileTokenRef = useRef("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const googleButtonRef = useGoogleAuth(() => turnstileTokenRef.current);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Full name is required.";
        } else if (formData.name.trim().length > 40) {
            newErrors.name = "Name cannot exceed 40 characters.";
        }
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
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
            ...(name === "password" ? { confirmPassword: "" } : {}),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Validation Error", {
                description: "Please fill in the highlighted fields.",
            });
            return;
        }
        if (!turnstileToken) {
            toast.warning("Please complete the CAPTCHA verification.");
            return;
        }

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            turnstileToken,
        }
        try {
            setIsSubmitting(true);
            const response = await signupUser(payload);
            toast.success("User created successfully");
            navigate("/login");
        } catch (err) {
            console.error(err.message);
            toast.error(err.message);
            turnstileTokenRef.current = "";
            setTurnstileToken("");
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (error) =>
        `w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 ${error
            ? "border-red-500 focus:border-red-500"
            : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"
        }`;

    const passwordClass = (error) =>
        `${inputClass(error)} pr-11`;

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
                    turnstileTokenRef.current = token;
                    setTurnstileToken(token);
                },
                "expired-callback": () => {
                    turnstileTokenRef.current = "";
                    setTurnstileToken("");
                },
                "error-callback": () => {
                    turnstileTokenRef.current = "";
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
            <div className="w-full lg:max-w-[60%]">

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

                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Start organizing your tasks with TodoNest.
                        </p>
                    </div>

                    <form
                        className="space-y-5 mt-4"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-4 lg:gap-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Full name
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        maxLength={40}
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={errors.name ? "name-error" : undefined}
                                        className={inputClass(errors.name)}
                                    />
                                </div>

                                {errors.name && (
                                    <p
                                        id="name-error"
                                        className="mt-1.5 text-xs font-medium text-red-600"
                                        role="alert"
                                    >
                                        {errors.name}
                                    </p>
                                )}
                            </div>

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
                                        className={inputClass(errors.email)}
                                    />
                                </div>

                                {errors.email && (
                                    <p
                                        id="email-error"
                                        className="mt-1.5 text-xs font-medium text-red-600"
                                        role="alert"
                                    >
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

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
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        maxLength={128}
                                        aria-invalid={Boolean(errors.password)}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                        className={passwordClass(errors.password)}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p
                                        id="password-error"
                                        className="mt-1.5 text-xs font-medium text-red-600"
                                        role="alert"
                                    >
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        autoComplete="new-password"
                                        maxLength={128}
                                        aria-invalid={Boolean(errors.confirmPassword)}
                                        aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                                        className={passwordClass(errors.confirmPassword)}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />}
                                    </button>
                                </div>

                                {errors.confirmPassword && (
                                    <p
                                        id="confirmPassword-error"
                                        className="mt-1.5 text-xs font-medium text-red-600"
                                        role="alert"
                                    >
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div ref={turnstileRef}></div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group mt-6 flex mx-auto w-full lg:w-[70%] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 lg:py-4 text-sm lg:text-md font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99] cursor-pointer"
                        >
                            {isSubmitting ? "Creating account..." : "Create account"}
                            {!isSubmitting && <ArrowRight
                                size={17}
                                className="transition-transform group-hover:translate-x-1"
                            />}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            Or sign up with email
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    {/* <button
                        type="button"
                        ref={googleButtonRef}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
                    >
                        <img
                            src={googleLogo}
                            alt=""
                            width="20"
                            height="20"
                        />
                        Continue with Google
                    </button> */}
                    <div className="flex w-full justify-center" ref={googleButtonRef}></div>
                    <p className="mt-7 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} TodoNest. All rights reserved.
                </p>
            </div>
        </main>
    );
}

export default Signup;
