package com.ympf.portfolio.education;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "educations")
public class Education extends AuditedEntity {

	@Column(nullable = false, length = 160)
	private String institution;
	@Column(nullable = false, length = 200)
	private String program;
	@Column(nullable = false, columnDefinition = "text")
	private String description;
	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;
	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;
	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	protected Education() {}

	public Education(String institution, String program, String description, LocalDate startDate,
			LocalDate endDate, int displayOrder, Instant now) {
		super(now);
		update(institution, program, description, startDate, endDate, displayOrder, now);
	}

	public void update(String institution, String program, String description, LocalDate startDate,
			LocalDate endDate, int displayOrder, Instant now) {
		this.institution = institution;
		this.program = program;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
		this.displayOrder = displayOrder;
		touch(now);
	}

	public String getInstitution() { return institution; }
	public String getProgram() { return program; }
	public String getDescription() { return description; }
	public LocalDate getStartDate() { return startDate; }
	public LocalDate getEndDate() { return endDate; }
	public int getDisplayOrder() { return displayOrder; }
}
