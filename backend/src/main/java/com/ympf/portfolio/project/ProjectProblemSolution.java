package com.ympf.portfolio.project;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_problem_solutions")
public class ProjectProblemSolution {

	@Id private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "project_id", nullable = false) private Project project;
	@Column(nullable = false, columnDefinition = "text") private String problem;
	@Column(nullable = false, columnDefinition = "text") private String cause;
	@Column(nullable = false, columnDefinition = "text") private String solution;
	@Column(nullable = false, columnDefinition = "text") private String verification;
	@Column(name = "display_order", nullable = false) private int displayOrder;

	protected ProjectProblemSolution() {}

	public ProjectProblemSolution(Project project, String problem, String cause, String solution,
			String verification, int displayOrder) {
		this.id = UUID.randomUUID(); this.project = project; this.problem = problem; this.cause = cause;
		this.solution = solution; this.verification = verification; this.displayOrder = displayOrder;
	}

	public UUID getId() { return id; }
	public String getProblem() { return problem; }
	public String getCause() { return cause; }
	public String getSolution() { return solution; }
	public String getVerification() { return verification; }
	public int getDisplayOrder() { return displayOrder; }
}
