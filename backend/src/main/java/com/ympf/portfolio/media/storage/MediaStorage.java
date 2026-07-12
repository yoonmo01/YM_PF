package com.ympf.portfolio.media.storage;

import java.io.IOException;

public interface MediaStorage {
	void store(String storageKey, byte[] content, String contentType) throws IOException;
	byte[] read(String storageKey) throws IOException;
	void delete(String storageKey) throws IOException;
}
