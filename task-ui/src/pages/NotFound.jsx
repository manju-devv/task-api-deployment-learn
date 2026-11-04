
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import notFoundImg from "./../assets/images/404.png";

function NotFound() {
    const navigate = useNavigate();
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-full text-center">
                <img src={notFoundImg} className="mx-auto object-cover" alt="Page not found" />
                <h1 className=" text-2xl font-bold text-slate-900">
                    Page not found
                </h1>
                <p className="mt-3 text-sm lg:text-md leading-6 text-slate-500">
                    Oops! The page you're looking for doesn't exist
                    or may have been moved.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-7 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    Go back
                </button>
            </div>
        </main>
    );
}

export default NotFound;
