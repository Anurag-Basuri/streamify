import {
    initNotificationQueue,
    closeNotificationQueue,
} from "./notification.queue.js";

export function initQueues() {
    initNotificationQueue();
}

export async function closeQueues() {
    await closeNotificationQueue();
}
