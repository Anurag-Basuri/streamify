package com.streamify.common;

import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Custom API exception matching the existing Node.js ApiError contract.
 * Contains statusCode, message, errors[], and an optional machine-readable code.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final List<String> errors;
    private final String code;

    public ApiException(HttpStatus httpStatus, String message) {
        this(httpStatus, message, List.of(), null);
    }

    public ApiException(HttpStatus httpStatus, String message, String code) {
        this(httpStatus, message, List.of(), code);
    }

    public ApiException(HttpStatus httpStatus, String message, List<String> errors, String code) {
        super(message);
        this.httpStatus = httpStatus;
        this.errors = errors != null ? errors : List.of();
        this.code = code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public int getStatusCode() {
        return httpStatus.value();
    }

    public List<String> getErrors() {
        return errors;
    }

    public String getCode() {
        return code;
    }

    // ---- Factory methods matching Node.js response helpers ----

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException badRequest(String message, String code) {
        return new ApiException(HttpStatus.BAD_REQUEST, message, code);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message, "AUTH_REQUIRED");
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message, "FORBIDDEN");
    }

    public static ApiException notFound(String resource) {
        return new ApiException(HttpStatus.NOT_FOUND,
                resource + " not found", resource.toUpperCase() + "_NOT_FOUND");
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message, "CONFLICT");
    }

    public static ApiException internalError(String message) {
        return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, message, "SERVER_ERROR");
    }
}
