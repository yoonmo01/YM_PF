package com.ympf.portfolio.common.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class AuditedEntity {

	@Id
	private UUID id;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected AuditedEntity() {
	}

	protected AuditedEntity(Instant now) {
		this.id = UUID.randomUUID();
		this.createdAt = now;
		this.updatedAt = now;
	}

	protected void touch(Instant now) {
		this.updatedAt = now;
	}

	public UUID getId() {
		return id;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
