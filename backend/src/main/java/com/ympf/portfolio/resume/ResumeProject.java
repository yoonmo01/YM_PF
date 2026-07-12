package com.ympf.portfolio.resume;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import com.ympf.portfolio.project.Project;

@Entity @Table(name = "resume_projects")
public class ResumeProject {
	@EmbeddedId private ResumeProjectId id;
	@MapsId("resumeId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "resume_id") private Resume resume;
	@MapsId("projectId") @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "project_id") private Project project;
	@Column(nullable = false) private int displayOrder;
	@Column(columnDefinition = "text") private String customSummary;
	protected ResumeProject() {}
	public ResumeProject(Resume resume, Project project, int displayOrder, String customSummary) { this.id = new ResumeProjectId(resume.getId(), project.getId()); this.resume = resume; this.project = project; this.displayOrder = displayOrder; this.customSummary = customSummary; }
	public Project getProject() { return project; } public int getDisplayOrder() { return displayOrder; } public String getCustomSummary() { return customSummary; }
}
