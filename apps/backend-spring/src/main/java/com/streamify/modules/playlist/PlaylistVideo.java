package com.streamify.modules.playlist;

import com.streamify.modules.video.Video;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "playlist_videos", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"playlist_id", "video_id"})
})
public class PlaylistVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(nullable = false)
    private int position = 0;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    @PrePersist
    protected void onCreate() {
        this.addedAt = Instant.now();
    }

    // ---- Getters and Setters ----

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Playlist getPlaylist() { return playlist; }
    public void setPlaylist(Playlist playlist) { this.playlist = playlist; }

    public Video getVideo() { return video; }
    public void setVideo(Video video) { this.video = video; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public Instant getAddedAt() { return addedAt; }
}
