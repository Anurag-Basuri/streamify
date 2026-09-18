package com.streamify.modules.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request DTOs for User authentication and profile operations.
 */
public final class UserDtos {

    private UserDtos() {}

    // ---- Registration ----
    public record RegisterRequest(
            @NotBlank(message = "Username is required")
            @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
            @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
            String userName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email address")
            String email,

            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 60, message = "Full name must be between 2 and 60 characters")
            String fullName,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
            String password
    ) {}

    // ---- Login ----
    public record LoginRequest(
            @NotBlank(message = "Email or username is required")
            String emailOrUsername,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    // ---- Google Auth ----
    public record GoogleAuthRequest(
            @NotBlank(message = "ID token is required")
            String idToken
    ) {}

    // ---- Refresh Token ----
    public record RefreshTokenRequest(
            String refreshToken  // can be null if cookie is used
    ) {}

    // ---- Password Reset ----
    public record ForgotPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email address")
            String email
    ) {}

    public record ResetPasswordRequest(
            @NotBlank(message = "New password is required")
            @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
            String password
    ) {}

    // ---- Change Password ----
    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required")
            String currentPassword,

            @NotBlank(message = "New password is required")
            @Size(min = 8, max = 100, message = "New password must be at least 8 characters")
            String newPassword
    ) {}

    // ---- Update Profile ----
    public record UpdateProfileRequest(
            @Size(min = 2, max = 60, message = "Full name must be between 2 and 60 characters")
            String fullName,

            @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
            @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
            String userName
    ) {}

    // ---- Auth Response ----
    public record AuthResponse(
            UserResponse user,
            String accessToken,
            String refreshToken
    ) {}

    // ---- User Response (public-facing user data) ----
    public record UserResponse(
            String id,
            String userName,
            String email,
            String fullName,
            String avatarUrl,
            String coverImageUrl,
            boolean isEmailVerified,
            String createdAt
    ) {}

    // ---- Channel Profile Response ----
    public record ChannelProfileResponse(
            String id,
            String userName,
            String fullName,
            String email,
            String avatarUrl,
            String coverImageUrl,
            long subscribersCount,
            long channelsSubscribedToCount,
            boolean isSubscribed,
            boolean isFollowing,
            long totalVideos,
            long totalViews,
            String createdAt
    ) {}
}
