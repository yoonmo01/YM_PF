package com.ympf.portfolio.media.config;

import java.nio.file.Path;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties("app.media")
public record MediaProperties(String provider, Path localPath, String bucket, String region, String endpoint,
		String accessKey, String secretKey, long maxFileSize, int maxWidth, int maxHeight) {

	public MediaProperties {
		provider = provider == null ? "local" : provider.strip().toLowerCase();
		if (!provider.equals("local") && !provider.equals("s3")) {
			throw new IllegalArgumentException("MEDIA_STORAGE_PROVIDER must be local or s3");
		}
		if (localPath == null) localPath = Path.of("./data/media");
		if (maxFileSize < 1 || maxFileSize > 20 * 1024 * 1024) {
			throw new IllegalArgumentException("MEDIA_MAX_FILE_SIZE must be between 1 byte and 20 MiB");
		}
		if (maxWidth < 1 || maxWidth > 20000 || maxHeight < 1 || maxHeight > 20000) {
			throw new IllegalArgumentException("Media dimensions must be between 1 and 20000 pixels");
		}
		if (provider.equals("s3")) {
			requireText(bucket, "MEDIA_STORAGE_BUCKET"); requireText(region, "MEDIA_STORAGE_REGION");
			requireText(accessKey, "MEDIA_STORAGE_ACCESS_KEY"); requireText(secretKey, "MEDIA_STORAGE_SECRET_KEY");
		}
	}

	private static void requireText(String value, String name) {
		if (!StringUtils.hasText(value)) throw new IllegalArgumentException(name + " must not be blank for s3 storage");
	}
}
