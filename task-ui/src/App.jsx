import { useState } from "react";
import SummaryCard from "./components/dashboard/SummaryCard";
import TaskSection from "./components/dashboard/TaskSection";
import DashboardHeader from "./components/layout/DashboardHeader";

function App() {
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
    <main className="min-h-screen bg-[#EEEEEE] text-slate-900">
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

        {/* Task Progress */}
        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
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
        </section>

        <TaskSection tasks={tasks} setTasks={setTasks} />
      </div>
    </main>
  );
}

export default App;
