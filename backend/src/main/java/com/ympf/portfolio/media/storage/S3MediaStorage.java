package com.ympf.portfolio.media.storage;

import java.io.IOException;
import java.net.URI;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.ympf.portfolio.media.config.MediaProperties;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Component
@ConditionalOnProperty(prefix = "app.media", name = "provider", havingValue = "s3")
public class S3MediaStorage implements MediaStorage {

	private final String bucket;
	private final S3Client client;

	public S3MediaStorage(MediaProperties properties) {
		bucket = properties.bucket();
		var builder = S3Client.builder()
				.region(Region.of(properties.region()))
				.credentialsProvider(StaticCredentialsProvider.create(
						AwsBasicCredentials.create(properties.accessKey(), properties.secretKey())));
		if (StringUtils.hasText(properties.endpoint())) {
			builder.endpointOverride(URI.create(properties.endpoint()))
					.serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
		}
		client = builder.build();
	}

	@Override
	public void store(String storageKey, byte[] content, String contentType) throws IOException {
		try {
			client.putObject(PutObjectRequest.builder().bucket(bucket).key(storageKey).contentType(contentType).build(),
					RequestBody.fromBytes(content));
		} catch (RuntimeException exception) { throw new IOException("Object storage write failed", exception); }
	}

	@Override
	public byte[] read(String storageKey) throws IOException {
		try { return client.getObjectAsBytes(GetObjectRequest.builder().bucket(bucket).key(storageKey).build()).asByteArray(); }
		catch (RuntimeException exception) { throw new IOException("Object storage read failed", exception); }
	}

	@Override
	public void delete(String storageKey) throws IOException {
		try { client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(storageKey).build()); }
		catch (RuntimeException exception) { throw new IOException("Object storage delete failed", exception); }
	}
}
