import { useState, useEffect } from "react";
import { createTaskAPI, editTaskAPI, getTaskByIdAPI, getTasksAPI, deleteTaskAPI } from "../../api/tasks";

function TaskSection({ tasks, setTasks }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [editMode, setIsEditMode] = useState(false);
    const [idToUpdate, setIdToUpdate] = useState(null);
    const [taskCompletedStatus, setTaskCompletedStatus] = useState(false);

    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [activeTab, setActiveTab] = useState("all");

    function resetTaskForm() {
        setTitle("");
        setFormError("");
        setIsEditMode(false);
        setIdToUpdate(null);
        setTaskCompletedStatus(false);
    }


    async function handleCreateOrUpdateTask(event) {
        event.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setFormError("Please enter a task title.");
            return;
        }
        if (trimmedTitle.length <= 5) {
            setFormError("Title must be more than 5 characters");
            return
        }
        try {
            setIsSaving(true);
            setFormError("");
            if (editMode) {
                await editTaskAPI(idToUpdate, { title: trimmedTitle, completed: taskCompletedStatus });
            } else {
                await createTaskAPI({
                    title: trimmedTitle,
                });
            }
            const refreshed = await fetchTasks();

            if (!refreshed) {
                setFormError("Saved successfully, but failed to refresh the task list.");
                return;
            }

            resetTaskForm();
            setIsModalOpen(false);
        } catch (err) {
            setFormError(err.message || `Failed to ${editMode ? "update" : "create"} task.`);
        } finally {
            setIsSaving(false);
        }
    }

    function handleDeleteTask(task) {
        setTaskToDelete(task);
    }

    async function confirmDeleteTask() {
        if (!taskToDelete) return;
        try {
            setIsDeleting(true);
            setError("");
            await deleteTaskAPI(taskToDelete._id);
            // setTasks((currentTasks) =>
            //     currentTasks.filter((task) => task._id !== taskToDelete._id)
            // );
            await fetchTasks();
            setTaskToDelete(null);
        } catch (err) {
            setError(err.message || "Failed to delete task.");
        } finally {
            setIsDeleting(false);
        }
    }

    async function updateStatusOfTask(task) {
        const nextCompletedStatus = !task.completed;
        try {
            setError("");
            await editTaskAPI(task._id, {
                title: task.title,
                completed: nextCompletedStatus,
            });
            await fetchTasks();
        } catch (err) {
            setError(err.message || "Failed to update task status.");
        }
    }

    async function fetchTasks() {
        try {
            setLoading(true);
            setError("");
            const result = await getTasksAPI();
            setTasks(result.tasks);
            return true;
        } catch (err) {
            console.error(err)
            setError(err.message || "Failed to load tasks!");
            return false;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    async function getTaskById(id) {
        try {
            setError("");
            setFormError("");
            const result = await getTaskByIdAPI(id);
            const task = result.task;
            setIdToUpdate(task._id);
            setTitle(task.title);
            setTaskCompletedStatus(task.completed);
            setIsEditMode(true);
            setIsModalOpen(true);
        } catch (err) {
            console.error(err.message);
            setFormError(err.message || "Failed to get task!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!isModalOpen && !taskToDelete) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isModalOpen, taskToDelete]);

    const filteredTasks = tasks.filter((task) => {
        if (activeTab === "active") return !task.completed;
        if (activeTab === "completed") return task.completed;
        return true;
    });

    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                            Your tasks
                        </h2>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                        </span>
                    </div>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Keep track of what needs to get done.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        resetTaskForm();
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white opacity-70 shadow-sm cursor-pointer"
                >
                    <span aria-hidden="true" className="text-lg leading-none">+</span>
                    New task
                </button>
            </div>

            <div className="flex gap-5 border-b border-slate-100 px-5 sm:px-7">
                {[
                    { label: "All", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Completed", value: "completed" },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`cursor-pointer border-b-2 py-3 text-sm font-medium transition ${activeTab === tab.value
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 text-xs">
                            {tab.value === "all"
                                ? tasks.length
                                : tab.value === "active"
                                    ? tasks.filter((task) => !task.completed).length
                                    : tasks.filter((task) => task.completed).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-5 sm:p-7">
                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                        Loading your tasks...
                    </p>
                ) : error ? (
                    <p role="alert" className="py-10 text-center text-sm text-red-600">
                        {error}
                    </p>
                ) : filteredTasks.length === 0 ? (
                    <div className="py-10 text-center">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl text-slate-400">
                            ✓
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-slate-800">
                            {activeTab === "active"
                                ? "No active tasks"
                                : activeTab === "completed"
                                    ? "No completed tasks"
                                    : "Your canvas is clear"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            {activeTab === "active"
                                ? "All caught up! You have no active tasks."
                                : activeTab === "completed"
                                    ? "Completed tasks will appear here."
                                    : "Your tasks will appear here when you create them."}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {filteredTasks.map((task) => (
                            <li
                                key={task._id}
                                className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`size-2.5 shrink-0 rounded-full ${task.completed
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                        }`}
                                />
                                <div className="min-w-0 flex-1">
                                    <span
                                        className={`min-w-0 flex-1 break-words text-sm font-medium ${task.completed
                                            ? "text-slate-400 line-through"
                                            : "text-slate-800"
                                            }`}
                                    >
                                        {task.title}
                                    </span>
                                    {task.createdAt && (
                                        <p className="mt-1 text-xs text-slate-400">
                                            Created at: {" "}
                                            {new Date(task.createdAt).toLocaleString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    )}
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${task.completed
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                        }`}
                                >
                                    {task.completed ? "Completed" : "Active"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => getTaskById(task._id)}
                                    aria-label={`Edit task: ${task.title}`}
                                    title="Edit task"
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateStatusOfTask(task)}
                                    aria-label={
                                        task.completed
                                            ? `Mark ${task.title} as active`
                                            : `Mark ${task.title} as completed`
                                    }
                                    title={task.completed ? "Mark as active" : "Mark as completed"}
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                                >
                                    {task.completed ? "↩" : "✓"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteTask(task)}
                                    aria-label={`Delete task: ${task.title}`}
                                    title="Delete task"
                                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600 cursor-pointer"
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSaving) {
                            setIsModalOpen(false);
                            resetTaskForm();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-task-title"
                        className="w-full max-w-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                    Your workspace
                                </p>
                                <h2
                                    id="create-task-title"
                                    className="mt-2 text-xl font-semibold tracking-tight text-slate-900"
                                >
                                    Create a new task
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Capture what you need to get done. You can manage its status later.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetTaskForm();
                                }}
                                aria-label="Close create task dialog"
                                className="cursor-pointer flex size-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdateTask} className="mt-6">
                            <label
                                htmlFor="task-title"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Task title
                            </label>

                            <input
                                id="task-title"
                                name="title"
                                type="text"
                                autoFocus
                                required
                                maxLength={200}
                                value={title}
                                onChange={(event) => {
                                    setTitle(event.target.value);
                                    setFormError("");
                                }}
                                placeholder="e.g. Complete API integration"
                                disabled={isSaving}
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-60"
                            />

                            <p className="mt-2 text-xs text-slate-400">
                                Keep it short and actionable.
                            </p>

                            {formError && (
                                <p
                                    role="alert"
                                    className="mt-2 text-xs text-red-500"
                                >
                                    {formError}
                                </p>
                            )}

                            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetTaskForm();
                                    }}
                                    className="rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving || !title.trim()}
                                    className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    {isSaving
                                        ? editMode
                                            ? "Saving changes..."
                                            : "Creating..."
                                        : editMode
                                            ? "Edit task"
                                            : "Create task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {taskToDelete && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isDeleting
                        ) {
                            setTaskToDelete(null);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        aria-describedby="delete-dialog-description"
                        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                                🗑️
                            </div>

                            <div className="min-w-0">
                                <h2
                                    id="delete-dialog-title"
                                    className="text-lg font-semibold text-slate-900"
                                >
                                    Delete this task?
                                </h2>

                                <p
                                    id="delete-dialog-description"
                                    className="mt-2 break-words text-sm leading-6 text-slate-500"
                                >
                                    Are you sure you want to delete{" "}
                                    <span className="font-medium text-slate-700">
                                        "{taskToDelete.title}"
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setTaskToDelete(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDeleteTask}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete task"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default TaskSection;