package com.ympf.portfolio.resume;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;
import com.ympf.portfolio.media.MediaFile;

@Entity
@Table(name = "resumes")
public class Resume extends AuditedEntity {
	@Column(nullable = false, length = 200) private String title;
	@Column(nullable = false, length = 200) private String companyName;
	@Column(nullable = false, length = 200) private String positionName;
	@Column(length = 500) private String jobPostingUrl;
	private LocalDate deadline;
	@Column(nullable = false, columnDefinition = "text") private String customSummary;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "profile_media_id") private MediaFile profileMedia;
	@Column(columnDefinition = "text") private String notes;
	@Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private ResumeStatus status;
	@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pdf_media_id") private MediaFile pdfMedia;
	private Instant submittedAt;
	protected Resume() {}
	public Resume(String title, String companyName, String positionName, String jobPostingUrl, LocalDate deadline,
			String customSummary, MediaFile profileMedia, String notes, Instant now) {
		super(now); this.title = title; this.companyName = companyName; this.positionName = positionName;
		this.jobPostingUrl = jobPostingUrl; this.deadline = deadline; this.customSummary = customSummary;
		this.profileMedia = profileMedia; this.notes = notes; this.status = ResumeStatus.DRAFT;
	}
	public void update(String title, String companyName, String positionName, String jobPostingUrl, LocalDate deadline,
			String customSummary, MediaFile profileMedia, String notes, Instant now) {
		this.title = title; this.companyName = companyName; this.positionName = positionName; this.jobPostingUrl = jobPostingUrl;
		this.deadline = deadline; this.customSummary = customSummary; this.profileMedia = profileMedia; this.notes = notes;
		this.pdfMedia = null; if (status == ResumeStatus.READY) status = ResumeStatus.DRAFT; touch(now);
	}
	public void ready(Instant now) { status = ResumeStatus.READY; submittedAt = null; touch(now); }
	public void submit(Instant now) { status = ResumeStatus.SUBMITTED; submittedAt = now; touch(now); }
	public void archive(Instant now) { status = ResumeStatus.ARCHIVED; touch(now); }
	public void setPdfMedia(MediaFile media, Instant now) { pdfMedia = media; touch(now); }
	public String getTitle() { return title; } public String getCompanyName() { return companyName; }
	public String getPositionName() { return positionName; } public String getJobPostingUrl() { return jobPostingUrl; }
	public LocalDate getDeadline() { return deadline; } public String getCustomSummary() { return customSummary; }
	public MediaFile getProfileMedia() { return profileMedia; } public String getNotes() { return notes; }
	public ResumeStatus getStatus() { return status; } public MediaFile getPdfMedia() { return pdfMedia; }
	public Instant getSubmittedAt() { return submittedAt; }
}
