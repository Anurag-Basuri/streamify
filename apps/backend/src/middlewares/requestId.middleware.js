import crypto from "crypto";

export function requestIdMiddleware(req, res, next) {
    const incoming = req.get("X-Request-Id");
    const requestId =
        incoming && typeof incoming === "string"
            ? incoming
            : crypto.randomUUID();

    req.id = requestId;
    res.setHeader("X-Request-Id", requestId);

    next();
}
