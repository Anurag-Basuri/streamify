package com.streamify.infrastructure.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.streamify.common.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service for uploading and managing media assets on Cloudinary.
 * Replaces the Node.js cloudinary.js utility.
 */
@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload a file to Cloudinary.
     *
     * @param file       The multipart file to upload
     * @param folder     Cloudinary folder (e.g., "streamify/avatars")
     * @param resourceType "image", "video", or "auto"
     * @return Map with "url" and "publicId"
     */
    public Map<String, String> upload(MultipartFile file, String folder, String resourceType) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "use_filename", true,
                    "unique_filename", true
            ));

            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");

            log.debug("Uploaded {} to Cloudinary: {}", resourceType, publicId);
            return Map.of("url", url, "publicId", publicId);
        } catch (IOException e) {
            log.error("Cloudinary upload failed", e);
            throw ApiException.internalError("Failed to upload file to cloud storage");
        }
    }

    /**
     * Upload an image (avatar, thumbnail, cover).
     */
    public Map<String, String> uploadImage(MultipartFile file, String folder) {
        return upload(file, folder, "image");
    }

    /**
     * Upload a video.
     */
    public Map<String, String> uploadVideo(MultipartFile file, String folder) {
        return upload(file, folder, "video");
    }

    /**
     * Delete a resource from Cloudinary by its public ID.
     */
    public void delete(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", resourceType
            ));
            log.debug("Deleted {} from Cloudinary: {}", resourceType, publicId);
        } catch (IOException e) {
            log.error("Cloudinary delete failed for {}: {}", publicId, e.getMessage());
            // Non-critical: log but don't throw
        }
    }

    public void deleteImage(String publicId) {
        delete(publicId, "image");
    }

    public void deleteVideo(String publicId) {
        delete(publicId, "video");
    }
}
