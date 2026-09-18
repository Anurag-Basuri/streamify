package com.streamify.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Paginated response wrapper matching the existing Node.js pagination shape.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PageResponse<T>(
        List<T> docs,
        long totalDocs,
        int totalPages,
        int page,
        int limit,
        boolean hasNextPage,
        boolean hasPrevPage
) {

    public static <T> PageResponse<T> of(List<T> docs, long totalDocs, int page, int limit) {
        int totalPages = (int) Math.ceil((double) totalDocs / limit);
        return new PageResponse<>(
                docs,
                totalDocs,
                totalPages,
                page,
                limit,
                page < totalPages,
                page > 1
        );
    }
}
