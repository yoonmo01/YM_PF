package com.ympf.portfolio.project;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "projects")
public class Project extends AuditedEntity {

	@Column(nullable = false, unique = true, length = 160) private String slug;
	@Column(nullable = false, length = 200) private String title;
	@Column(nullable = false, length = 500) private String summary;
	@Column(nullable = false, columnDefinition = "text") private String background;
	@Column(nullable = false, columnDefinition = "text") private String problem;
	@Column(nullable = false, columnDefinition = "text") private String goal;
	@Column(nullable = false, length = 300) private String role;
	@Column(nullable = false, columnDefinition = "text") private String responsibilities;
	@Column(nullable = false, columnDefinition = "text") private String implementation;
	@Column(name = "technical_decisions", nullable = false, columnDefinition = "text") private String technicalDecisions;
	@Column(nullable = false, columnDefinition = "text") private String results;
	@Column(nullable = false, columnDefinition = "text") private String limitations;
	@Column(nullable = false, columnDefinition = "text") private String retrospective;
	@Column(name = "start_date") private LocalDate startDate;
	@Column(name = "end_date") private LocalDate endDate;
	@Column(name = "team_size") private Integer teamSize;
	@Column(name = "github_url", length = 500) private String githubUrl;
	@Column(name = "demo_url", length = 500) private String demoUrl;
	@Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private ProjectStatus status;
	@Column(nullable = false) private boolean featured;
	@Column(name = "display_order", nullable = false) private int displayOrder;

	protected Project() {}

	public Project(String slug, String title, String summary, String background, String problem,
			String goal, String role, String responsibilities, String implementation,
			String technicalDecisions, String results, String limitations, String retrospective,
			LocalDate startDate, LocalDate endDate, Integer teamSize, String githubUrl,
			String demoUrl, boolean featured, int displayOrder, Instant now) {
		super(now);
		this.status = ProjectStatus.DRAFT;
		update(slug, title, summary, background, problem, goal, role, responsibilities,
				implementation, technicalDecisions, results, limitations, retrospective,
				startDate, endDate, teamSize, githubUrl, demoUrl, featured, displayOrder, now);
	}

	public void update(String slug, String title, String summary, String background, String problem,
			String goal, String role, String responsibilities, String implementation,
			String technicalDecisions, String results, String limitations, String retrospective,
			LocalDate startDate, LocalDate endDate, Integer teamSize, String githubUrl,
			String demoUrl, boolean featured, int displayOrder, Instant now) {
		this.slug = slug; this.title = title; this.summary = summary; this.background = background;
		this.problem = problem; this.goal = goal; this.role = role; this.responsibilities = responsibilities;
		this.implementation = implementation; this.technicalDecisions = technicalDecisions;
		this.results = results; this.limitations = limitations; this.retrospective = retrospective;
		this.startDate = startDate; this.endDate = endDate; this.teamSize = teamSize;
		this.githubUrl = githubUrl; this.demoUrl = demoUrl; this.featured = featured;
		this.displayOrder = displayOrder; touch(now);
	}

	public void publish(Instant now) { status = ProjectStatus.PUBLISHED; touch(now); }
	public void archive(Instant now) { status = ProjectStatus.ARCHIVED; touch(now); }

	public String getSlug() { return slug; }
	public String getTitle() { return title; }
	public String getSummary() { return summary; }
	public String getBackground() { return background; }
	public String getProblem() { return problem; }
	public String getGoal() { return goal; }
	public String getRole() { return role; }
	public String getResponsibilities() { return responsibilities; }
	public String getImplementation() { return implementation; }
	public String getTechnicalDecisions() { return technicalDecisions; }
	public String getResults() { return results; }
	public String getLimitations() { return limitations; }
	public String getRetrospective() { return retrospective; }
	public LocalDate getStartDate() { return startDate; }
	public LocalDate getEndDate() { return endDate; }
	public Integer getTeamSize() { return teamSize; }
	public String getGithubUrl() { return githubUrl; }
	public String getDemoUrl() { return demoUrl; }
	public ProjectStatus getStatus() { return status; }
	public boolean isFeatured() { return featured; }
	public int getDisplayOrder() { return displayOrder; }
}
