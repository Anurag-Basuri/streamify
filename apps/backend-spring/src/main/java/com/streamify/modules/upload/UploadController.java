package com.streamify.modules.upload;

import com.streamify.common.ApiResponse;
import com.streamify.infrastructure.media.CloudinaryService;
import com.streamify.modules.upload.UploadDtos.UploadResponse;
import com.streamify.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Generic file upload endpoint matching Node.js POST /api/v1/upload.
 */
@RestController
@RequestMapping("/api/v1/upload")
@Tag(name = "Upload", description = "Generic file upload")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file to Cloudinary")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "uploadType", defaultValue = "misc") String uploadType) {

        // Sanitize the upload type
        String safeType = uploadType.trim().toLowerCase().replaceAll("[^a-z0-9\\-_]", "");
        if (safeType.isBlank()) safeType = "misc";

        String folder = "streamify/" + safeType;
        Map<String, String> result = cloudinaryService.upload(file, folder, "auto");

        UploadResponse response = new UploadResponse(
                result.get("url"),
                result.get("publicId"),
                "auto"
        );

        return ResponseEntity.ok(ApiResponse.ok(response, "File uploaded successfully"));
    }
}
