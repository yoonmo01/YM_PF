package com.ympf.portfolio.media.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.ympf.portfolio.media.config.MediaProperties;

@Component
@ConditionalOnProperty(prefix = "app.media", name = "provider", havingValue = "local", matchIfMissing = true)
public class LocalMediaStorage implements MediaStorage {

	private final Path root;

	public LocalMediaStorage(MediaProperties properties) throws IOException {
		root = properties.localPath().toAbsolutePath().normalize();
		Files.createDirectories(root);
	}

	@Override
	public void store(String storageKey, byte[] content, String contentType) throws IOException {
		Path target = safePath(storageKey);
		Files.createDirectories(target.getParent());
		Files.write(target, content, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
	}

	@Override public byte[] read(String storageKey) throws IOException { return Files.readAllBytes(safePath(storageKey)); }
	@Override public void delete(String storageKey) throws IOException { Files.deleteIfExists(safePath(storageKey)); }

	private Path safePath(String storageKey) throws IOException {
		Path target = root.resolve(storageKey).normalize();
		if (!target.startsWith(root)) throw new IOException("Invalid storage key");
		return target;
	}
}
