
import { useRef, useState } from "react";
import { Camera, Pencil, UserRound, Check, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USER_ID_KEY = "taskUserId";


function DashboardHeader() {
    const fileInputRef = useRef(null);
    const [userId, setUserId] = useState(() => localStorage.getItem(USER_ID_KEY) || "");
    const [name, setName] = useState("My workspace");
    const [photo, setPhoto] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState("My workspace");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!userId) return;
        async function loadProfile() {
            try {
                const response = await fetch(`${API_BASE_URL}/users/${userId}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to load profile!");
                }
                setName(data.user.name);
                setDraftName(data.user.name);
                setPhoto(data.user.photoUrl || "");
            } catch (e) {
                console.error(e);
            }
        }
        loadProfile();
    }, [userId]);

    async function ensureUserExists(profileName) {
        if (userId) return userId;
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profileName }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to create user.");
            }
            const newUserId = data.user._id;
            localStorage.setItem(USER_ID_KEY, newUserId);
            setUserId(newUserId);
            return newUserId;
        } catch (err) {
            console.error(e);
        }
    }

    async function saveName() {
        const trimmedName = draftName.trim();
        if (!trimmedName) {
            toast.error("Name cannot be empty.");
            return;
        }
        setIsSaving(true);
        try {
            if (!userId) {
                await ensureUserExists(trimmedName);
            } else {
                const response = await fetch(
                    `${API_BASE_URL}/users/${userId}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: trimmedName }),
                    }
                );

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to update name.");
                }
            }
            setName(trimmedName);
            setDraftName(trimmedName);
            setIsEditing(false);
            toast.success("Your profile have been saved successfully.");
        } catch (error) {
            toast.error(error.message || "Unable to save name.")
        } finally {
            setIsSaving(false);
        }
    }

    async function handlePhotoChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.warning("Please select an image.")
            event.target.value = "";
            return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.warning("Please select a JPEG, PNG, or WebP image")
            event.target.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            toast.warning("Please choose an image smaller than 1 MB.")
            event.target.value = "";
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading("Saving Profile", {
            description: "Please wait...",
        });
        try {
            const currentUserId = await ensureUserExists(name);
            const formData = new FormData();
            formData.append("photo", file);
            formData.append("userId", currentUserId);
            const response = await fetch(`${API_BASE_URL}/profile-photo`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Photo upload failed.");
            }
            setPhoto(data.url);
            toast.success("Profile Updated", {
                id: toastId,
                description: "Your profile photo updated successfully.",
            });
        } catch (error) {
            toast.error("Update Failed", {
                id: toastId,
                description: error.message || "Please try again.",
            });
        } finally {
            setIsSaving(false);
            event.target.value = "";
        }
    }

    function cancelEditing() {
        setDraftName(name);
        setIsEditing(false);
    }

    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-sm font-medium text-indigo-600">
                    YOUR WORKSPACE
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Task Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    Manage your tasks in one place.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-white shadow-sm">
                        {photo ? (
                            <img
                                src={photo}
                                alt={`${name}'s profile`}
                                className="size-full object-cover"
                            />
                        ) : (
                            <UserRound size={23} />
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Change profile photo"
                        title="Change profile photo"
                        className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white transition hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                    >
                        <Camera size={12} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </div>

                <div className="min-w-0">
                    {isEditing ? (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                saveName();
                            }}
                            className="flex items-center gap-1"
                        >
                            <input
                                autoFocus
                                maxLength={40}
                                value={draftName}
                                onChange={(event) =>
                                    setDraftName(event.target.value)
                                }
                                aria-label="Profile name"
                                className="w-36 rounded-md border border-slate-200 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                            />

                            <button
                                type="submit"
                                disabled={isSaving}
                                aria-label="Save name"
                                className="rounded p-1 text-emerald-600 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
                            >
                                <Check size={16} />
                            </button>

                            <button
                                type="button"
                                onClick={cancelEditing}
                                aria-label="Cancel editing name"
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </form>
                    ) : (
                        <div className="flex items-center gap-2">
                            <p className="max-w-44 truncate text-sm font-semibold text-slate-900">
                                {name}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setDraftName(name);
                                    setIsEditing(true);
                                }}
                                aria-label="Edit profile name"
                                title="Edit name"
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer"
                            >
                                <Pencil size={13} />
                            </button>
                        </div>
                    )}

                    <p className="mt-1 text-xs text-slate-500">
                        Personal tasks
                    </p>
                </div>
            </div>
        </header>
    );
}

export default DashboardHeader;
