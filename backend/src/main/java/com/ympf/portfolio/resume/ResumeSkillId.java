package com.ympf.portfolio.resume;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Embeddable;

@Embeddable
public record ResumeSkillId(UUID resumeId, UUID skillId) implements Serializable { public ResumeSkillId() { this(null, null); } }
