import IORedis from "ioredis";

let redis = null;

export function isRedisEnabled() {
    return Boolean(process.env.REDIS_URL);
}

export function getRedis() {
    return redis;
}

export async function initRedis() {
    if (!isRedisEnabled()) return null;
    if (redis) return redis;

    redis = new IORedis(process.env.REDIS_URL, {
        enableReadyCheck: true,
        maxRetriesPerRequest: null,
        lazyConnect: true,
    });

    // Avoid crashing the app on transient redis errors.
    redis.on("error", (err) => {
        console.warn("⚠️ Redis error:", err?.message || err);
    });

    await redis.connect();
    return redis;
}

export async function closeRedis() {
    if (!redis) return;
    try {
        await redis.quit();
    } catch {
        try {
            redis.disconnect();
        } catch {
            // ignore
        }
    } finally {
        redis = null;
    }
}
