package com.streamify.modules.upload;

/**
 * DTOs for the generic file upload endpoint.
 */
public final class UploadDtos {

    private UploadDtos() {}

    public record UploadResponse(
            String url,
            String publicId,
            String resourceType
    ) {}
}
