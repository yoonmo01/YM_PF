package com.ympf.portfolio.media;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.UuidGenerator;

import com.ympf.portfolio.project.Project;

@Entity
@Table(name = "project_media")
public class ProjectMedia {
	@Id @GeneratedValue @UuidGenerator private UUID id;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "project_id") private Project project;
	@ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "media_id") private MediaFile media;
	@Enumerated(EnumType.STRING) @Column(nullable = false, length = 32) private MediaRole mediaRole;
	@Column(nullable = false) private int displayOrder;
	protected ProjectMedia() {}
	public ProjectMedia(Project project, MediaFile media, MediaRole mediaRole, int displayOrder) { this.project = project; this.media = media; this.mediaRole = mediaRole; this.displayOrder = displayOrder; }
	public void reorder(MediaRole mediaRole, int displayOrder) { this.mediaRole = mediaRole; this.displayOrder = displayOrder; }
	public UUID getId() { return id; } public Project getProject() { return project; } public MediaFile getMedia() { return media; }
	public MediaRole getMediaRole() { return mediaRole; } public int getDisplayOrder() { return displayOrder; }
}
