package com.ympf.portfolio.resume;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public record ResumeExperienceId(UUID resumeId, UUID experienceId) implements Serializable { public ResumeExperienceId() { this(null, null); } }
