package com.ympf.portfolio.media;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.ympf.portfolio.common.validation.SafeText;

public final class MediaDtos {
	private MediaDtos() {}
	public record MediaMetadataRequest(@NotBlank @Size(max = 300) @SafeText String altText,
			@Size(max = 1000) @SafeText String caption) {}
	public record AdminMediaResponse(UUID id, String originalName, String mimeType, long fileSize, int width,
			int height, String altText, String caption, String url, long usageCount, Instant createdAt, Instant updatedAt) {}
	public record ProjectMediaRequest(@NotNull UUID mediaId, @NotNull MediaRole mediaRole,
			@Min(0) @Max(10000) int displayOrder) {}
	public record ProjectMediaOrderItem(@NotNull UUID projectMediaId, @Min(0) @Max(10000) int displayOrder) {}
	public record ProjectMediaOrderRequest(@NotNull @Size(max = 100) List<@Valid ProjectMediaOrderItem> items) {}
	public record AdminProjectMediaResponse(UUID id, UUID mediaId, String originalName, MediaRole mediaRole,
			int displayOrder, String altText, String caption, int width, int height, String url) {}
	public record PublicMediaResponse(String mediaRole, int displayOrder, String altText, String caption,
			int width, int height, String url) {}
	public record MediaContent(byte[] bytes, String mimeType) {}
}
