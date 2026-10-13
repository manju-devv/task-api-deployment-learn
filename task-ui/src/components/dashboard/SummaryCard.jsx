function SummaryCard({
    label,
    value,
    description,
    accent = "indigo",
    progress = 0,
}) {
    const accentStyles = {
        indigo: {
            indicator: "bg-indigo-500",
            label: "text-indigo-600",
            surface: "bg-indigo-50",
        },
        emerald: {
            indicator: "bg-emerald-500",
            label: "text-emerald-600",
            surface: "bg-emerald-50",
        },
        amber: {
            indicator: "bg-amber-500",
            label: "text-amber-600",
            surface: "bg-amber-50",
        },
    };

    const styles = accentStyles[accent] ?? accentStyles.indigo;
    const safeProgress = Math.min(100, Math.max(0, progress));

    return (
        <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {label}
                </p>

                <span
                    className={`size-2.5 rounded-full ${styles.indicator} `}
                    aria-hidden="true"
                />
            </div>

            <p className={`mt-4 text-3xl font-semibold tracking-tight ${styles.label} `}>
                {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                {description}
            </p>

            <div
                className={`mt-5 h-1 w-[20%] overflow-hidden rounded-full ${styles.surface} `}
                role="progressbar"
                aria-label={`${label} progress`}
                aria-valuenow={safeProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`h-full rounded-full transition-all duration-500 ${styles.indicator} `}
                    style={{ width: `${safeProgress}% ` }}
                />
            </div>
        </article>
    );
}

export default SummaryCard;
