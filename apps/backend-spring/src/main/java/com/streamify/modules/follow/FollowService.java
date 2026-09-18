package com.streamify.modules.follow;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.follow.Follow;
import com.streamify.modules.follow.FollowRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class FollowService {

    private final FollowRepository followRepository;
    private final UserService userService;

    public FollowService(FollowRepository followRepository, UserService userService) {
        this.followRepository = followRepository;
        this.userService = userService;
    }

    public Map<String, Object> toggleFollow(UUID followerId, UUID followeeId) {
        if (followerId.equals(followeeId)) {
            throw ApiException.badRequest("Cannot follow yourself");
        }

        Optional<Follow> existing = followRepository.findByFollowerIdAndFolloweeId(followerId, followeeId);

        boolean following;
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            following = false;
        } else {
            User follower = userService.findUserById(followerId);
            User followee = userService.findUserById(followeeId);
            Follow follow = new Follow();
            follow.setFollower(follower);
            follow.setFollowee(followee);
            followRepository.save(follow);
            following = true;
        }

        long count = followRepository.countByFolloweeId(followeeId);
        return Map.of("following", following, "followersCount", count);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getFollowers(UUID userId, int page, int limit) {
        Page<Follow> followPage = followRepository
                .findByFolloweeIdOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = followPage.getContent().stream()
                .map(f -> userToMap(f.getFollower(), f))
                .toList();

        return PageResponse.of(docs, followPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getFollowing(UUID userId, int page, int limit) {
        Page<Follow> followPage = followRepository
                .findByFollowerIdOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, limit));

        List<Map<String, Object>> docs = followPage.getContent().stream()
                .map(f -> userToMap(f.getFollowee(), f))
                .toList();

        return PageResponse.of(docs, followPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(UUID followerId, UUID followeeId) {
        return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
    }

    private Map<String, Object> userToMap(User user, Follow follow) {
        return Map.of(
                "id", user.getId().toString(),
                "userName", user.getUserName(),
                "fullName", user.getFullName(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "followedAt", follow.getCreatedAt().toString()
        );
    }
}
