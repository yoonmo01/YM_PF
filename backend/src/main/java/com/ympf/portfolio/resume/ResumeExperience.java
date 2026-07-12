package com.ympf.portfolio.resume;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import com.ympf.portfolio.experience.Experience;

@Entity @Table(name = "resume_experiences")
public class ResumeExperience {
	@EmbeddedId private ResumeExperienceId id;
	@MapsId("resumeId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "resume_id") private Resume resume;
	@MapsId("experienceId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "experience_id") private Experience experience;
	@Column(nullable = false) private int displayOrder;
	@Column(columnDefinition = "text") private String customDescription;
	protected ResumeExperience() {}
	public ResumeExperience(Resume resume, Experience experience, int displayOrder, String customDescription) { this.id = new ResumeExperienceId(resume.getId(), experience.getId()); this.resume = resume; this.experience = experience; this.displayOrder = displayOrder; this.customDescription = customDescription; }
	public Experience getExperience() { return experience; } public int getDisplayOrder() { return displayOrder; } public String getCustomDescription() { return customDescription; }
}
