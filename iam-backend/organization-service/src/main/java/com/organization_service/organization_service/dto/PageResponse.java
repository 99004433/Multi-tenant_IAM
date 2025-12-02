package com.organization_service.organization_service.dto;

import java.util.List;
import lombok.Data;

@Data
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private long totalPages;

    public PageResponse(List<T> content, int page, int size, long totalElements) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = (long) Math.ceil((double) totalElements / size);
    }
}

