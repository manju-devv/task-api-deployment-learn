
function DashboardHeader() {
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
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    TD
                </div>
                <div>
                    <p className="text-sm font-semibold">My workspace</p>
                    <p className="text-xs text-slate-500">Personal tasks</p>
                </div>
            </div>
        </header>
    )
}

export default DashboardHeader;
