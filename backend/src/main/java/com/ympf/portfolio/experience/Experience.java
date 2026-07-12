package com.ympf.portfolio.experience;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "experiences")
public class Experience extends AuditedEntity {

	@Column(nullable = false, length = 160)
	private String organization;
	@Column(nullable = false, length = 160)
	private String title;
	@Column(nullable = false, columnDefinition = "text")
	private String description;
	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;
	@Column(name = "end_date")
	private LocalDate endDate;
	@Column(name = "is_current", nullable = false)
	private boolean current;
	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	protected Experience() {}

	public Experience(String organization, String title, String description, LocalDate startDate,
			LocalDate endDate, boolean current, int displayOrder, Instant now) {
		super(now);
		update(organization, title, description, startDate, endDate, current, displayOrder, now);
	}

	public void update(String organization, String title, String description, LocalDate startDate,
			LocalDate endDate, boolean current, int displayOrder, Instant now) {
		this.organization = organization;
		this.title = title;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
		this.current = current;
		this.displayOrder = displayOrder;
		touch(now);
	}

	public String getOrganization() { return organization; }
	public String getTitle() { return title; }
	public String getDescription() { return description; }
	public LocalDate getStartDate() { return startDate; }
	public LocalDate getEndDate() { return endDate; }
	public boolean isCurrent() { return current; }
	public int getDisplayOrder() { return displayOrder; }
}
