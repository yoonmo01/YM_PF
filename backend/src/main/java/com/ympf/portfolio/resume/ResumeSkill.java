package com.ympf.portfolio.resume;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import com.ympf.portfolio.skill.Skill;

@Entity @Table(name = "resume_skills")
public class ResumeSkill {
	@EmbeddedId private ResumeSkillId id;
	@MapsId("resumeId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "resume_id") private Resume resume;
	@MapsId("skillId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "skill_id") private Skill skill;
	@Column(nullable = false) private int displayOrder;
	protected ResumeSkill() {}
	public ResumeSkill(Resume resume, Skill skill, int displayOrder) { this.id = new ResumeSkillId(resume.getId(), skill.getId()); this.resume = resume; this.skill = skill; this.displayOrder = displayOrder; }
	public Skill getSkill() { return skill; } public int getDisplayOrder() { return displayOrder; }
}
