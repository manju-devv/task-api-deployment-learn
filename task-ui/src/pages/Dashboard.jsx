
import { useState } from "react";
import SummaryCard from "../components/dashboard/SummaryCard";
import TaskSection from "../components/dashboard/TaskSection";
import DashboardHeader from "../components/layout/DashboardHeader";

function Dashboard() {
    const [tasks, setTasks] = useState([]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const remainingTasks = totalTasks - completedTasks;

    const progress = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    const completedProgress =
        totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    const remainingProgress =
        totalTasks === 0 ? 0 : (remainingTasks / totalTasks) * 100;

    return (
        <main className="relative min-h-screen bg-[#EEEEEE] text-slate-900">
            <div className="sticky z-50 top-0"><p className="absolute right-4 top-3 select-none text-[11px] font-medium tracking-wide text-slate-400">
                v1.0.0
            </p></div>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
                <DashboardHeader />

                <section
                    aria-label="Task summary"
                    className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <SummaryCard
                        label="Total tasks"
                        value={totalTasks}
                        description="All your tasks in one place"
                        accent="indigo"
                        progress={totalTasks > 0 ? 100 : 0}
                    />

                    <SummaryCard
                        label="Completed"
                        value={completedTasks}
                        description="Tasks you've finished"
                        accent="emerald"
                        progress={completedProgress}
                    />

                    <SummaryCard
                        label="Remaining"
                        value={remainingTasks}
                        description="Tasks still to do"
                        accent="amber"
                        progress={remainingProgress}
                    />
                </section>

                {/* <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Overall progress
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {completedTasks} of {totalTasks} tasks completed
                            </p>
                        </div>

                        <span className="text-lg font-semibold text-indigo-600">
                            {progress}%
                        </span>
                    </div>

                    <div
                        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label="Task completion progress"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </section> */}
                <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-slate-900">
                            Overall progress
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Here's how you're progressing with your tasks.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">

                        {/* Donut Chart */}
                        <div
                            className="relative flex size-48 shrink-0 items-center justify-center rounded-full"
                            style={{
                                background: totalTasks === 0
                                    ? "conic-gradient(#e2e8f0 0% 100%)"
                                    : `conic-gradient(
                        #4f46e5 0% ${completedProgress}%,
                        #f59e0b ${completedProgress}% 100%
                    )`
                            }}
                            role="img"
                            aria-label={`${progress}% completed, ${100 - progress}% remaining`}
                        >
                            <div className="flex size-36 flex-col items-center justify-center rounded-full bg-white">
                                <span className="text-3xl font-bold tracking-tight text-slate-900">
                                    {progress}%
                                </span>
                                <span className="mt-1 text-xs font-medium text-slate-500">
                                    Completed
                                </span>
                            </div>
                        </div>

                        {/* Chart Details */}
                        <div className="w-full max-w-xs space-y-5">

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="size-3 rounded-full bg-indigo-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Completed
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Tasks you've finished
                                        </p>
                                    </div>
                                </div>

                                <span className="text-lg font-semibold text-slate-900">
                                    {completedTasks}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="size-3 rounded-full bg-amber-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Remaining
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Tasks still to do
                                        </p>
                                    </div>
                                </div>

                                <span className="text-lg font-semibold text-slate-900">
                                    {remainingTasks}
                                </span>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Total tasks
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {totalTasks}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <TaskSection tasks={tasks} setTasks={setTasks} />
            </div>
        </main>
    );
}

export default Dashboard;
