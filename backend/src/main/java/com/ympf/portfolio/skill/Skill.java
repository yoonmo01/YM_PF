package com.ympf.portfolio.skill;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "skills")
public class Skill extends AuditedEntity {

	@Column(nullable = false, length = 100)
	private String name;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private SkillCategory category;
	@Column(name = "display_order", nullable = false)
	private int displayOrder;
	@Column(name = "is_visible", nullable = false)
	private boolean visible;

	protected Skill() {}

	public Skill(String name, SkillCategory category, int displayOrder, boolean visible, Instant now) {
		super(now);
		update(name, category, displayOrder, visible, now);
	}

	public void update(String name, SkillCategory category, int displayOrder, boolean visible, Instant now) {
		this.name = name;
		this.category = category;
		this.displayOrder = displayOrder;
		this.visible = visible;
		touch(now);
	}

	public String getName() { return name; }
	public SkillCategory getCategory() { return category; }
	public int getDisplayOrder() { return displayOrder; }
	public boolean isVisible() { return visible; }
}
