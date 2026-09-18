package com.streamify.infrastructure.media;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * FFmpeg video processing utility.
 * Uses ProcessBuilder on Virtual Threads for non-blocking execution.
 * Gracefully falls back when ffmpeg binary is not available.
 */
@Service
public class FFmpegService {

    private static final Logger log = LoggerFactory.getLogger(FFmpegService.class);

    @Value("${app.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    /**
     * Check if ffmpeg is available on the system.
     */
    public boolean isFFmpegAvailable() {
        try {
            Process p = new ProcessBuilder(ffmpegPath, "-version")
                    .redirectErrorStream(true)
                    .start();
            boolean finished = p.waitFor(5, TimeUnit.SECONDS);
            if (finished) {
                p.destroy();
                return p.exitValue() == 0;
            }
            p.destroyForcibly();
            return false;
        } catch (Exception e) {
            log.debug("FFmpeg not available: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Probe media file for metadata (duration, resolution, codecs).
     *
     * @param file path to the media file
     * @return map with keys: duration, width, height, videoCodec, audioCodec
     */
    public Map<String, Object> probeMedia(Path file) {
        if (!isFFmpegAvailable()) {
            log.warn("FFmpeg not available — skipping media probe for {}", file);
            return Map.of();
        }

        try {
            String ffprobePath = ffmpegPath.replace("ffmpeg", "ffprobe");
            Process p = new ProcessBuilder(
                    ffprobePath,
                    "-v", "quiet",
                    "-print_format", "json",
                    "-show_format",
                    "-show_streams",
                    file.toAbsolutePath().toString()
            ).redirectErrorStream(true).start();

            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                output = sb.toString();
            }

            boolean finished = p.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                log.warn("ffprobe timed out for {}", file);
                return Map.of();
            }

            log.debug("ffprobe output for {}: {}", file.getFileName(), output);
            return Map.of("raw", output);
        } catch (Exception e) {
            log.error("ffprobe failed for {}: {}", file, e.getMessage());
            return Map.of();
        }
    }

    /**
     * Generate a thumbnail from a video at a specific timestamp.
     *
     * @param videoPath  source video
     * @param outputPath output image path
     * @param atSeconds  timestamp in seconds
     * @return true if successful
     */
    public boolean generateThumbnail(Path videoPath, Path outputPath, double atSeconds) {
        if (!isFFmpegAvailable()) {
            log.warn("FFmpeg not available — cannot generate thumbnail for {}", videoPath);
            return false;
        }

        try {
            Process p = new ProcessBuilder(
                    ffmpegPath,
                    "-y",
                    "-ss", String.valueOf(atSeconds),
                    "-i", videoPath.toAbsolutePath().toString(),
                    "-vframes", "1",
                    "-q:v", "2",
                    outputPath.toAbsolutePath().toString()
            ).redirectErrorStream(true).start();

            boolean finished = p.waitFor(60, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return false;
            }

            return p.exitValue() == 0;
        } catch (Exception e) {
            log.error("Thumbnail generation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Transcode video to H.264/AAC MP4 with faststart for streaming.
     *
     * @param input  source video file
     * @param output destination MP4 file
     * @return true if successful
     */
    public boolean transcodeToH264(Path input, Path output) {
        if (!isFFmpegAvailable()) {
            log.warn("FFmpeg not available — cannot transcode {}", input);
            return false;
        }

        try {
            Process p = new ProcessBuilder(
                    ffmpegPath,
                    "-y",
                    "-i", input.toAbsolutePath().toString(),
                    "-c:v", "libx264",
                    "-preset", "medium",
                    "-crf", "23",
                    "-c:a", "aac",
                    "-b:a", "128k",
                    "-movflags", "+faststart",
                    output.toAbsolutePath().toString()
            ).redirectErrorStream(true).start();

            boolean finished = p.waitFor(10, TimeUnit.MINUTES);
            if (!finished) {
                p.destroyForcibly();
                log.warn("Transcode timed out for {}", input);
                return false;
            }

            return p.exitValue() == 0;
        } catch (Exception e) {
            log.error("Transcoding failed: {}", e.getMessage());
            return false;
        }
    }
}
