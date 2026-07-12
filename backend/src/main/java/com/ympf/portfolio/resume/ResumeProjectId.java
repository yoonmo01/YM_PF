package com.ympf.portfolio.resume;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public record ResumeProjectId(UUID resumeId, UUID projectId) implements Serializable { public ResumeProjectId() { this(null, null); } }
