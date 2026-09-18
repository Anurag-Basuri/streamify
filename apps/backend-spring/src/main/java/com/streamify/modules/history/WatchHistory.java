package com.streamify.modules.history;

import com.streamify.modules.user.User;
import com.streamify.modules.video.Video;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "watch_history", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "video_id"})
})
public class WatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(name = "watched_at", nullable = false)
    private Instant watchedAt;

    @Column(name = "playback_timestamp", nullable = false)
    private double playbackTimestamp = 0;

    @Column(name = "video_duration", nullable = false)
    private double videoDuration = 0;

    @PrePersist
    protected void onCreate() {
        this.watchedAt = Instant.now();
    }

    // ---- Getters and Setters ----

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Video getVideo() { return video; }
    public void setVideo(Video video) { this.video = video; }

    public Instant getWatchedAt() { return watchedAt; }
    public void setWatchedAt(Instant watchedAt) { this.watchedAt = watchedAt; }

    public double getPlaybackTimestamp() { return playbackTimestamp; }
    public void setPlaybackTimestamp(double playbackTimestamp) { this.playbackTimestamp = playbackTimestamp; }

    public double getVideoDuration() { return videoDuration; }
    public void setVideoDuration(double videoDuration) { this.videoDuration = videoDuration; }
}
