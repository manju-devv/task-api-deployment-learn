
import { apiRequest } from "./client";
import { routes } from "./routes";

export async function getTasksAPI() {
    const route = routes.getTasks;
    return await apiRequest(route.url, {
        method: route.method,
    });
}



export async function createTaskAPI(body) {
    const route = routes.createTask;
    return await apiRequest(route.url, {
        method: route.method,
        body: JSON.stringify(body),
    });
}

export async function getTaskByIdAPI(id) {
    const route = routes.getTaskById;
    return await apiRequest(`${route.url}/${id}`, {
        method: route.method,
    });
}

export async function editTaskAPI(id, body) {
    const route = routes.updateTask;
    return await apiRequest(`${route.url}/${id}`, {
        method: route.method,
        body: JSON.stringify(body),
    });
}

export async function deleteTaskAPI(id) {
    const route = routes.deleteTask;
    return apiRequest(`${route.url}/${id}`, {
        method: route.method,
    });
}

