package com.ympf.portfolio.media;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "media_files")
public class MediaFile extends AuditedEntity {
	@Column(nullable = false, length = 255) private String originalName;
	@Column(nullable = false, unique = true, length = 500) private String storageKey;
	@Column(nullable = false, length = 100) private String mimeType;
	@Column(nullable = false) private long fileSize;
	private Integer width;
	private Integer height;
	@Column(nullable = false, length = 300) private String altText;
	@Column(length = 1000) private String caption;

	protected MediaFile() {}
	public MediaFile(String originalName, String storageKey, String mimeType, long fileSize, Integer width, Integer height,
			String altText, String caption, Instant now) {
		super(now); this.originalName = originalName; this.storageKey = storageKey; this.mimeType = mimeType;
		this.fileSize = fileSize; this.width = width; this.height = height; this.altText = altText; this.caption = caption;
	}
	public void updateMetadata(String altText, String caption, Instant now) { this.altText = altText; this.caption = caption; touch(now); }
	public String getOriginalName() { return originalName; } public String getStorageKey() { return storageKey; }
	public String getMimeType() { return mimeType; } public long getFileSize() { return fileSize; }
	public Integer getWidth() { return width; } public Integer getHeight() { return height; }
	public String getAltText() { return altText; } public String getCaption() { return caption; }
}
