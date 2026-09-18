package com.streamify.modules.user;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.streamify.common.ApiException;
import com.streamify.infrastructure.mail.EmailService;
import com.streamify.infrastructure.media.CloudinaryService;
import com.streamify.modules.follow.FollowRepository;
import com.streamify.modules.subscription.SubscriptionRepository;
import com.streamify.modules.video.VideoRepository;
import com.streamify.modules.user.UserDtos.*;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserRepository;
import com.streamify.security.JwtTokenProvider;
import com.streamify.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;
    private final SubscriptionRepository subscriptionRepository;
    private final FollowRepository followRepository;
    private final VideoRepository videoRepository;

    @Value("${app.google.client-id}")
    private String googleClientId;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       EmailService emailService,
                       CloudinaryService cloudinaryService,
                       SubscriptionRepository subscriptionRepository,
                       FollowRepository followRepository,
                       VideoRepository videoRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.cloudinaryService = cloudinaryService;
        this.subscriptionRepository = subscriptionRepository;
        this.followRepository = followRepository;
        this.videoRepository = videoRepository;
    }

    // ---- Registration ----

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already registered");
        }
        if (userRepository.existsByUserName(req.userName())) {
            throw ApiException.conflict("Username already taken");
        }

        User user = new User();
        user.setUserName(req.userName());
        user.setEmail(req.email().toLowerCase().trim());
        user.setFullName(req.fullName());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setAvatarUrl(generateDefaultAvatar(req.fullName()));

        // Generate email verification token
        String verifyToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verifyToken);
        user.setEmailVerificationExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verifyToken);

        return generateAuthResponse(user);
    }

    // ---- Login ----

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailOrUserName(req.emailOrUsername())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email/username or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email/username or password");
        }

        return generateAuthResponse(user);
    }

    // ---- Google OAuth ----

    public AuthResponse googleAuth(GoogleAuthRequest req) {
        GoogleIdToken.Payload payload = verifyGoogleIdToken(req.idToken());
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String fullName = (String) payload.get("name");
        String avatarUrl = (String) payload.get("picture");

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);

        if (user == null) {
            // Create new user from Google
            user = new User();
            user.setGoogleId(googleId);
            user.setEmail(email.toLowerCase().trim());
            user.setFullName(fullName != null ? fullName : "User");
            user.setUserName(generateUniqueUsername(email));
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setAvatarUrl(avatarUrl);
            user.setEmailVerified(true);
            user = userRepository.save(user);
            log.info("New Google user registered: {}", email);
        } else {
            // Link or update existing user
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
            }
            if (avatarUrl != null && user.getAvatarUrl() == null) {
                user.setAvatarUrl(avatarUrl);
            }
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
            }
            user = userRepository.save(user);
        }

        return generateAuthResponse(user);
    }

    // ---- Refresh Token ----

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw ApiException.unauthorized("Refresh token is required");
        }

        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw ApiException.unauthorized("Invalid or expired refresh token");
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken, true);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("User not found"));

        if (!refreshToken.equals(user.getRefreshToken())) {
            // Possible token reuse → clear all tokens
            user.setRefreshToken(null);
            userRepository.save(user);
            throw ApiException.unauthorized("Refresh token has been revoked");
        }

        return generateAuthResponse(user);
    }

    // ---- Logout ----

    public void logout(UUID userId) {
        User user = findUserById(userId);
        user.setRefreshToken(null);
        userRepository.save(user);
    }

    // ---- Get Current User ----

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = findUserById(principal.getId());
        return toUserResponse(user);
    }

    // ---- Update Profile ----

    public UserResponse updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = findUserById(userId);

        if (req.fullName() != null && !req.fullName().isBlank()) {
            user.setFullName(req.fullName());
        }

        if (req.userName() != null && !req.userName().isBlank()) {
            if (!user.getUserName().equals(req.userName()) && userRepository.existsByUserName(req.userName())) {
                throw ApiException.conflict("Username already taken");
            }
            user.setUserName(req.userName());
        }

        user = userRepository.save(user);
        return toUserResponse(user);
    }

    // ---- Change Password ----

    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    // ---- Forgot Password ----

    public void forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.email().toLowerCase().trim())
                .orElse(null);

        if (user == null) {
            // Don't reveal whether the email exists
            log.debug("Forgot password for non-existent email: {}", req.email());
            return;
        }

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken);
        log.info("Password reset token generated for: {}", user.getEmail());
    }

    // ---- Reset Password ----

    public void resetPassword(String token, ResetPasswordRequest req) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset token"));

        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    // ---- Verify Email ----

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> ApiException.badRequest("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt() != null
                && user.getEmailVerificationExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);
    }

    // ---- Update Avatar ----

    public UserResponse updateAvatar(UUID userId, String avatarUrl, String avatarPublicId) {
        User user = findUserById(userId);
        // Delete old avatar from Cloudinary
        if (user.getAvatarPublicId() != null && !user.getAvatarPublicId().equals(avatarPublicId)) {
            cloudinaryService.deleteImage(user.getAvatarPublicId());
        }
        user.setAvatarUrl(avatarUrl);
        user.setAvatarPublicId(avatarPublicId);
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    // ---- Update Cover Image ----

    public UserResponse updateCoverImage(UUID userId, String coverUrl, String coverPublicId) {
        User user = findUserById(userId);
        // Delete old cover from Cloudinary
        if (user.getCoverImagePublicId() != null && !user.getCoverImagePublicId().equals(coverPublicId)) {
            cloudinaryService.deleteImage(user.getCoverImagePublicId());
        }
        user.setCoverImageUrl(coverUrl);
        user.setCoverImagePublicId(coverPublicId);
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    // ---- Get Channel Profile ----

    @Transactional(readOnly = true)
    public ChannelProfileResponse getChannelProfile(String username, UUID currentUserId) {
        User channel = userRepository.findByUserName(username)
                .orElseThrow(() -> ApiException.notFound("Channel not found"));

        long subscribersCount = subscriptionRepository.countByChannelId(channel.getId());
        long channelsSubscribedToCount = subscriptionRepository.countBySubscriberId(channel.getId());
        boolean isSubscribed = currentUserId != null
                && subscriptionRepository.existsBySubscriberIdAndChannelId(currentUserId, channel.getId());
        boolean isFollowing = currentUserId != null
                && followRepository.existsByFollowerIdAndFolloweeId(currentUserId, channel.getId());
        long totalVideos = videoRepository.countByOwnerIdAndDeletedFalse(channel.getId());
        long totalViews = videoRepository.sumViewsByOwner(channel.getId());

        return new ChannelProfileResponse(
                channel.getId().toString(),
                channel.getUserName(),
                channel.getFullName(),
                channel.getEmail(),
                channel.getAvatarUrl(),
                channel.getCoverImageUrl(),
                subscribersCount,
                channelsSubscribedToCount,
                isSubscribed,
                isFollowing,
                totalVideos,
                totalViews,
                channel.getCreatedAt().toString()
        );
    }

    // ---- Resend Verification ----

    public void resendVerificationEmail(UUID userId) {
        User user = findUserById(userId);
        if (user.isEmailVerified()) {
            throw ApiException.badRequest("Email is already verified");
        }
        String verifyToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verifyToken);
        user.setEmailVerificationExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verifyToken);
    }

    // ---- Helpers ----

    public User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User"));
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getUserName(), user.getFullName());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        // Persist refresh token for rotation detection
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return new AuthResponse(toUserResponse(user), accessToken, refreshToken);
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId().toString(),
                user.getUserName(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getCoverImageUrl(),
                user.isEmailVerified(),
                user.getCreatedAt().toString()
        );
    }

    private String generateDefaultAvatar(String fullName) {
        return "https://ui-avatars.com/api/?name=" + fullName.replace(" ", "+")
                + "&background=random&color=fff&bold=true&size=200";
    }

    private String generateUniqueUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        if (base.length() > 24) base = base.substring(0, 24);
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUserName(candidate)) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw ApiException.unauthorized("Invalid Google ID token");
            }
            return idToken.getPayload();
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google ID token verification failed", e);
            throw ApiException.unauthorized("Google authentication failed");
        }
    }
}
