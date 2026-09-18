package com.streamify.modules.user;

import com.streamify.common.ApiResponse;
import com.streamify.modules.user.UserDtos.*;
import com.streamify.modules.user.UserService;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User authentication and profile management")
public class UserController {

    private final UserService userService;
    private final com.streamify.infrastructure.media.CloudinaryService cloudinaryService;

    @Value("${app.jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    @Value("${app.google.client-id}")
    private String googleClientId;

    public UserController(UserService userService,
                          com.streamify.infrastructure.media.CloudinaryService cloudinaryService) {
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
    }

    // ---- Registration ----

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        AuthResponse auth = userService.register(request);
        setCookies(response, auth.accessToken(), auth.refreshToken());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(auth, "User registered successfully"));
    }

    // ---- Login ----

    @PostMapping("/login")
    @Operation(summary = "Login with email/username and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        AuthResponse auth = userService.login(request);
        setCookies(response, auth.accessToken(), auth.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(auth, "Logged in successfully"));
    }

    // ---- Google Auth ----

    @PostMapping("/auth/google")
    @Operation(summary = "Authenticate with Google ID token")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(
            @Valid @RequestBody GoogleAuthRequest request,
            HttpServletResponse response) {

        AuthResponse auth = userService.googleAuth(request);
        setCookies(response, auth.accessToken(), auth.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(auth, "Google authentication successful"));
    }

    @GetMapping("/auth/google/client-id")
    @Operation(summary = "Get Google OAuth client ID")
    public ResponseEntity<ApiResponse<Map<String, String>>> getGoogleClientId() {
        return ResponseEntity.ok(ApiResponse.ok(Map.of("clientId", googleClientId)));
    }

    // ---- Refresh Token ----

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        String refreshToken = extractRefreshToken(request, httpRequest);
        AuthResponse auth = userService.refreshToken(refreshToken);
        setCookies(response, auth.accessToken(), auth.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(auth, "Token refreshed successfully"));
    }

    // ---- Logout ----

    @PostMapping("/logout")
    @Operation(summary = "Logout current user")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletResponse response) {

        userService.logout(principal.getId());
        clearCookies(response);
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }

    // ---- Get Current User ----

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {

        UserResponse user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    // ---- Update Profile ----

    @PatchMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse user = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(user, "Profile updated successfully"));
    }

    // ---- Change Password ----

    @PatchMapping("/change-password")
    @Operation(summary = "Change password for current user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Password changed successfully"));
    }

    // ---- Forgot Password ----

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        userService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok(null,
                "If this email is registered, a password reset link has been sent"));
    }

    // ---- Reset Password ----

    @PostMapping("/reset-password/{token}")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable String token,
            @Valid @RequestBody ResetPasswordRequest request) {

        userService.resetPassword(token, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "Password reset successfully"));
    }

    // ---- Verify Email ----

    @GetMapping("/verify-email/{token}")
    @Operation(summary = "Verify user email address")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@PathVariable String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok(null, "Email verified successfully"));
    }

    // ---- Channel Profile ----

    @GetMapping("/c/{username}")
    @Operation(summary = "Get public channel profile by username")
    public ResponseEntity<ApiResponse<ChannelProfileResponse>> getChannelProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal principal) {

        java.util.UUID currentUserId = principal != null ? principal.getId() : null;
        ChannelProfileResponse profile = userService.getChannelProfile(username, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    // ---- Avatar Upload ----

    @PatchMapping(value = "/change-avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload/change user avatar")
    public ResponseEntity<ApiResponse<UserResponse>> changeAvatar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("avatar") org.springframework.web.multipart.MultipartFile avatar) {

        java.util.Map<String, String> upload = cloudinaryService.uploadImage(avatar, "streamify/avatars");

        UserResponse user = userService.updateAvatar(
                principal.getId(), upload.get("url"), upload.get("publicId"));
        return ResponseEntity.ok(ApiResponse.ok(user, "Avatar updated successfully"));
    }

    // ---- Cover Image Upload ----

    @PatchMapping(value = "/change-cover-image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload/change user cover image")
    public ResponseEntity<ApiResponse<UserResponse>> changeCoverImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("coverImage") org.springframework.web.multipart.MultipartFile coverImage) {

        java.util.Map<String, String> upload = cloudinaryService.uploadImage(coverImage, "streamify/covers");

        UserResponse user = userService.updateCoverImage(
                principal.getId(), upload.get("url"), upload.get("publicId"));
        return ResponseEntity.ok(ApiResponse.ok(user, "Cover image updated successfully"));
    }

    // ---- Resend Verification ----

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @AuthenticationPrincipal UserPrincipal principal) {
        userService.resendVerificationEmail(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "Verification email sent"));
    }

    // ---- Cookie Helpers ----

    private void setCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (refreshTokenExpiryMs / 1000));
        accessCookie.setAttribute("SameSite", "None");
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) (refreshTokenExpiryMs / 1000));
        refreshCookie.setAttribute("SameSite", "None");
        response.addCookie(refreshCookie);
    }

    private void clearCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("accessToken", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }

    private String extractRefreshToken(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            return request.refreshToken();
        }
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
