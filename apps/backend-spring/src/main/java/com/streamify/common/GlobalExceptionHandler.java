package com.streamify.common;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler producing the same JSON error shape the React frontend expects:
 * { statusCode, message, success: false, errors: [] }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---- Application-level ApiException ----
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex, HttpServletRequest req) {
        log.warn("ApiException [{}]: {} — {}", ex.getStatusCode(), ex.getMessage(), req.getRequestURI());
        return buildResponse(ex.getHttpStatus(), ex.getMessage(), ex.getErrors(), ex.getCode());
    }

    // ---- Bean Validation errors (Jakarta @Valid) ----
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .toList();
        String firstMessage = errors.isEmpty() ? "Validation error" : errors.getFirst();
        return buildResponse(HttpStatus.BAD_REQUEST, firstMessage, errors, "VALIDATION_ERROR");
    }

    // ---- Missing request parameters ----
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null, null);
    }

    // ---- Type mismatch (e.g. invalid UUID in path) ----
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = "Invalid value for parameter '" + ex.getName() + "'";
        return buildResponse(HttpStatus.BAD_REQUEST, msg, null, "INVALID_PARAMETER");
    }

    // ---- 404 Not Found ----
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoResourceFoundException ex, HttpServletRequest req) {
        String msg = "Route " + req.getMethod() + " " + req.getRequestURI() + " not found";
        return buildResponse(HttpStatus.NOT_FOUND, msg, null, null);
    }

    // ---- Spring Security: bad credentials ----
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password", null, "BAD_CREDENTIALS");
    }

    // ---- Spring Security: access denied ----
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied", null, "FORBIDDEN");
    }

    // ---- File too large ----
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.PAYLOAD_TOO_LARGE, "File size exceeds the maximum allowed", null, "FILE_TOO_LARGE");
    }

    // ---- Catch-all ----
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {} {}", req.getMethod(), req.getRequestURI(), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", null, "SERVER_ERROR");
    }

    // ---- Helper ----
    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status, String message, Object errors, String code) {
        Map<String, Object> body = new HashMap<>();
        body.put("statusCode", status.value());
        body.put("message", message);
        body.put("success", false);
        if (errors != null) body.put("errors", errors);
        if (code != null) body.put("code", code);
        return ResponseEntity.status(status).body(body);
    }
}
