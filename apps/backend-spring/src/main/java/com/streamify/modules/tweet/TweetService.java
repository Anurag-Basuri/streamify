package com.streamify.modules.tweet;

import com.streamify.common.ApiException;
import com.streamify.common.PageResponse;
import com.streamify.modules.like.LikeRepository;
import com.streamify.modules.comment.CommentRepository;
import com.streamify.modules.tweet.Tweet;
import com.streamify.modules.tweet.TweetRepository;
import com.streamify.modules.user.User;
import com.streamify.modules.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class TweetService {

    private final TweetRepository tweetRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;

    public TweetService(TweetRepository tweetRepository,
                        LikeRepository likeRepository,
                        CommentRepository commentRepository,
                        UserService userService) {
        this.tweetRepository = tweetRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
    }

    public Map<String, Object> createTweet(UUID userId, String content) {
        if (content == null || content.isBlank()) {
            throw ApiException.badRequest("Tweet content is required");
        }

        User user = userService.findUserById(userId);
        Tweet tweet = new Tweet();
        tweet.setOwner(user);
        tweet.setContent(content);
        tweet = tweetRepository.save(tweet);

        return toTweetMap(tweet, userId);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getFeed(UUID currentUserId, int page, int limit) {
        Page<Tweet> tweetPage = tweetRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page - 1, limit));
        List<Map<String, Object>> docs = tweetPage.getContent().stream()
                .map(t -> toTweetMap(t, currentUserId))
                .toList();
        return PageResponse.of(docs, tweetPage.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getUserTweets(UUID userId, UUID currentUserId, int page, int limit) {
        Page<Tweet> tweetPage = tweetRepository.findByOwnerIdOrderByCreatedAtDesc(userId, PageRequest.of(page - 1, limit));
        List<Map<String, Object>> docs = tweetPage.getContent().stream()
                .map(t -> toTweetMap(t, currentUserId))
                .toList();
        return PageResponse.of(docs, tweetPage.getTotalElements(), page, limit);
    }

    public Map<String, Object> updateTweet(UUID tweetId, UUID userId, String content) {
        Tweet tweet = tweetRepository.findById(tweetId)
                .orElseThrow(() -> ApiException.notFound("Tweet"));
        if (!tweet.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("You can only edit your own tweets");
        }
        tweet.setContent(content);
        tweet = tweetRepository.save(tweet);
        return toTweetMap(tweet, userId);
    }

    public void deleteTweet(UUID tweetId, UUID userId) {
        Tweet tweet = tweetRepository.findById(tweetId)
                .orElseThrow(() -> ApiException.notFound("Tweet"));
        if (!tweet.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("You can only delete your own tweets");
        }
        tweetRepository.delete(tweet);
    }

    private Map<String, Object> toTweetMap(Tweet tweet, UUID currentUserId) {
        User owner = tweet.getOwner();
        long likesCount = likeRepository.countByEntityTypeAndEntityId("Tweet", tweet.getId());
        boolean isLiked = currentUserId != null &&
                likeRepository.existsByLikedByIdAndEntityTypeAndEntityId(currentUserId, "Tweet", tweet.getId());
        long commentsCount = commentRepository.countByEntityTypeAndEntityIdAndParentIsNull("Tweet", tweet.getId());

        return Map.of(
                "id", tweet.getId().toString(),
                "content", tweet.getContent(),
                "owner", Map.of(
                        "id", owner.getId().toString(),
                        "userName", owner.getUserName(),
                        "fullName", owner.getFullName(),
                        "avatarUrl", owner.getAvatarUrl() != null ? owner.getAvatarUrl() : ""
                ),
                "likesCount", likesCount,
                "isLiked", isLiked,
                "commentsCount", commentsCount,
                "createdAt", tweet.getCreatedAt().toString(),
                "updatedAt", tweet.getUpdatedAt().toString()
        );
    }
}
