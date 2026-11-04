export const routes = {
    getTasks: {
        url: "/tasks",
        method: "GET",
    },

    getTaskById: {
        url: "/tasks",
        method: "GET",
    },

    createTask: {
        url: "/tasks",
        method: "POST",
    },

    updateTask: {
        url: "/tasks",
        method: "PUT",
    },

    deleteTask: {
        url: "/tasks",
        method: "DELETE",
    },

    signUp: {
        url: "/auth/signup",
        method: "POST",
    },

    login: {
        url: "/auth/login",
        method: "POST",
    },

    googleAuth: {
        url: "/auth/google",
        method: "POST",
    },

    about: {
        url: "/users/me",
        method: "GET",
    },
};