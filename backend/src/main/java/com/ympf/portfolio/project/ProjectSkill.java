package com.ympf.portfolio.project;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import com.ympf.portfolio.skill.Skill;

@Entity
@Table(name = "project_skills")
public class ProjectSkill {

	@EmbeddedId private ProjectSkillId id;
	@MapsId("projectId") @ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "project_id") private Project project;
	@MapsId("skillId") @ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "skill_id") private Skill skill;
	@Column(name = "display_order", nullable = false) private int displayOrder;

	protected ProjectSkill() {}

	public ProjectSkill(Project project, Skill skill, int displayOrder) {
		this.id = new ProjectSkillId(project.getId(), skill.getId());
		this.project = project;
		this.skill = skill;
		this.displayOrder = displayOrder;
	}

	public Project getProject() { return project; }
	public Skill getSkill() { return skill; }
	public int getDisplayOrder() { return displayOrder; }
}
