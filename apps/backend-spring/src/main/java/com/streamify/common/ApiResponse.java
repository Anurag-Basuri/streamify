package com.streamify.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Standardised API response envelope matching the existing Node.js contract:
 * { statusCode, data, message, success }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        int statusCode,
        T data,
        String message,
        boolean success
) {

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(200, data, message, true);
    }

    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, "Success");
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return new ApiResponse<>(201, data, message, true);
    }

    public static <T> ApiResponse<T> created(T data) {
        return created(data, "Created successfully");
    }

    public static ApiResponse<Void> noContent() {
        return new ApiResponse<>(204, null, null, true);
    }

    public static <T> ApiResponse<T> error(int statusCode, String message) {
        return new ApiResponse<>(statusCode, null, message, false);
    }
}
