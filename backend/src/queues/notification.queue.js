import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Notification } from "../models/notification.model.js";
import { getSocketIO } from "../utils/notifications.js";

const QUEUE_NAME = "notifications";
const JOB_UPLOAD_FANOUT = "upload:fanout";

let queue = null;
let worker = null;

function isRedisConfigured() {
    return Boolean(process.env.REDIS_URL);
}

function createConnection() {
    return new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
    });
}

export function initNotificationQueue() {
    if (!isRedisConfigured()) {
        return { queue: null, worker: null };
    }

    if (!queue) {
        queue = new Queue(QUEUE_NAME, { connection: createConnection() });
    }

    if (!worker) {
        worker = new Worker(
            QUEUE_NAME,
            async (job) => {
                if (job.name !== JOB_UPLOAD_FANOUT) return;

                const { uploaderId, videoId } = job.data || {};
                if (!uploaderId || !videoId) return;

                if (!mongoose.isValidObjectId(uploaderId)) return;
                if (!mongoose.isValidObjectId(videoId)) return;

                const [uploader, video] = await Promise.all([
                    User.findById(uploaderId).select(
                        "_id userName fullName avatar"
                    ),
                    Video.findById(videoId).select("_id title thumbnail"),
                ]);

                if (!uploader || !video) return;

                const subscriberIds = await Subscription.distinct(
                    "subscriber",
                    {
                        channel: uploader._id,
                    }
                );

                const recipients = (subscriberIds || []).filter(
                    (id) => id && id.toString() !== uploader._id.toString()
                );

                if (recipients.length === 0) return;

                const message = `${uploader.userName || uploader.fullName} uploaded a new video: "${video.title}"`;
                const link = `/watch/${video._id}`;
                const metadata = {
                    videoTitle: video.title,
                    videoThumbnail: video.thumbnail,
                };

                const docs = recipients.map((recipient) => ({
                    recipient,
                    sender: uploader._id,
                    type: "upload",
                    message,
                    link,
                    entityType: "Video",
                    entityId: video._id,
                    metadata,
                }));

                const inserted = await Notification.insertMany(docs, {
                    ordered: false,
                }).catch(() => []);

                // Best-effort realtime emit
                const io = getSocketIO();
                if (io && inserted.length > 0) {
                    for (const n of inserted) {
                        io.to(`user:${n.recipient.toString()}`).emit(
                            "notification:new",
                            {
                                ...n.toObject?.(),
                                sender: {
                                    _id: uploader._id,
                                    userName: uploader.userName,
                                    fullName: uploader.fullName,
                                    avatar: uploader.avatar,
                                },
                            }
                        );
                    }
                }
            },
            { connection: createConnection() }
        );

        worker.on("failed", (job, err) => {
            console.error(
                `❌ Queue job failed: ${job?.name} (${job?.id})`,
                err?.message || err
            );
        });
    }

    return { queue, worker };
}

export async function enqueueUploadNotificationFanout({ uploaderId, videoId }) {
    if (!isRedisConfigured()) return false;
    if (!queue) initNotificationQueue();
    if (!queue) return false;

    await queue.add(
        JOB_UPLOAD_FANOUT,
        { uploaderId, videoId },
        {
            attempts: 5,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: 1000,
            removeOnFail: 5000,
        }
    );

    return true;
}

export async function closeNotificationQueue() {
    try {
        if (worker) await worker.close();
    } catch {
        // ignore
    } finally {
        worker = null;
    }

    try {
        if (queue) await queue.close();
    } catch {
        // ignore
    } finally {
        queue = null;
    }
}
