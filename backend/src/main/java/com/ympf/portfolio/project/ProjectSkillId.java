package com.ympf.portfolio.project;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public record ProjectSkillId(
		@Column(name = "project_id") UUID projectId,
		@Column(name = "skill_id") UUID skillId) implements Serializable {
	public ProjectSkillId() { this(null, null); }
}
