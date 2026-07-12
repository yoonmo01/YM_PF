package com.ympf.portfolio.media;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.media.MediaDtos.AdminMediaResponse;
import com.ympf.portfolio.media.MediaDtos.AdminProjectMediaResponse;
import com.ympf.portfolio.media.MediaDtos.MediaContent;
import com.ympf.portfolio.media.MediaDtos.MediaMetadataRequest;
import com.ympf.portfolio.media.MediaDtos.ProjectMediaOrderRequest;
import com.ympf.portfolio.media.MediaDtos.ProjectMediaRequest;
import com.ympf.portfolio.media.MediaDtos.PublicMediaResponse;
import com.ympf.portfolio.media.config.MediaProperties;
import com.ympf.portfolio.media.storage.MediaStorage;
import com.ympf.portfolio.project.Project;
import com.ympf.portfolio.project.ProjectRepository;

@Service
public class MediaService {
	private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/png", "image/jpeg");
	private final MediaFileRepository mediaFiles; private final ProjectMediaRepository projectMedia;
	private final ProjectRepository projects; private final MediaStorage storage; private final MediaProperties properties;
	private final Clock clock;
	public MediaService(MediaFileRepository mediaFiles, ProjectMediaRepository projectMedia, ProjectRepository projects,
			MediaStorage storage, MediaProperties properties, Clock clock) {
		this.mediaFiles = mediaFiles; this.projectMedia = projectMedia; this.projects = projects;
		this.storage = storage; this.properties = properties; this.clock = clock;
	}

	@Transactional(readOnly = true)
	public List<AdminMediaResponse> list() { return mediaFiles.findAllByOrderByUpdatedAtDesc().stream().map(this::adminResponse).toList(); }

	@Transactional
	public AdminMediaResponse upload(MultipartFile file, String altText, String caption) {
		if (file == null || file.isEmpty()) throw badFile("MEDIA_FILE_REQUIRED", "An image file is required");
		if (file.getSize() > properties.maxFileSize()) throw badFile("MEDIA_FILE_TOO_LARGE", "Image exceeds the configured size limit");
		String originalName = safeOriginalName(file.getOriginalFilename());
		String extension = extension(originalName);
		byte[] bytes;
		try { bytes = file.getBytes(); } catch (IOException exception) { throw storageError(exception); }
		if (bytes.length < 1 || bytes.length > properties.maxFileSize()) throw badFile("MEDIA_FILE_TOO_LARGE", "Image exceeds the configured size limit");
		String detectedMime = detectMime(bytes);
		String declaredMime = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
		if (!ALLOWED_MIME_TYPES.contains(declaredMime) || !declaredMime.equals(detectedMime)
				|| !(extension.equals("png") && detectedMime.equals("image/png")
				|| (extension.equals("jpg") || extension.equals("jpeg")) && detectedMime.equals("image/jpeg"))) {
			throw badFile("MEDIA_TYPE_INVALID", "Only genuine PNG and JPEG images are accepted");
		}
		BufferedImage image;
		try { image = ImageIO.read(new ByteArrayInputStream(bytes)); } catch (IOException exception) { throw badFile("MEDIA_IMAGE_INVALID", "Image could not be decoded"); }
		if (image == null || image.getWidth() < 1 || image.getHeight() < 1
				|| image.getWidth() > properties.maxWidth() || image.getHeight() > properties.maxHeight()) {
			throw badFile("MEDIA_DIMENSIONS_INVALID", "Image dimensions are invalid or exceed the configured limit");
		}
		LocalDate today = LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC);
		String key = "images/%04d/%02d/%s.%s".formatted(today.getYear(), today.getMonthValue(), UUID.randomUUID(), extension);
		try { storage.store(key, bytes, detectedMime); } catch (IOException exception) { throw storageError(exception); }
		try {
			MediaFile saved = mediaFiles.save(new MediaFile(originalName, key, detectedMime, bytes.length,
					image.getWidth(), image.getHeight(), altText.strip(), nullable(caption), clock.instant()));
			return adminResponse(saved);
		} catch (RuntimeException exception) {
			try { storage.delete(key); } catch (IOException ignored) { /* best-effort rollback cleanup */ }
			throw exception;
		}
	}

	@Transactional
	public AdminMediaResponse update(UUID id, MediaMetadataRequest request) {
		MediaFile media = requireMedia(id); media.updateMetadata(request.altText().strip(), nullable(request.caption()), clock.instant());
		return adminResponse(media);
	}

	@Transactional
	public void delete(UUID id) {
		MediaFile media = requireMedia(id); if (projectMedia.countByMedia_Id(id) > 0) throw new ApiException(HttpStatus.CONFLICT, "MEDIA_IN_USE", "Media is attached and must be detached first");
		try { storage.delete(media.getStorageKey()); } catch (IOException exception) { throw storageError(exception); }
		mediaFiles.delete(media);
	}

	@Transactional
	public AdminProjectMediaResponse attach(UUID projectId, ProjectMediaRequest request) {
		Project project = requireProject(projectId); MediaFile media = requireMedia(request.mediaId());
		if (request.mediaRole() == MediaRole.COVER && projectMedia.existsByProject_IdAndMediaRole(projectId, MediaRole.COVER))
			throw new ApiException(HttpStatus.CONFLICT, "PROJECT_COVER_EXISTS", "Project already has a cover image");
		if (projectMedia.findByProject_IdOrderByMediaRoleAscDisplayOrderAsc(projectId).stream().anyMatch(item -> item.getMedia().getId().equals(media.getId())))
			throw new ApiException(HttpStatus.CONFLICT, "MEDIA_ALREADY_ATTACHED", "Media is already attached to the project");
		try { return projectResponse(projectMedia.saveAndFlush(new ProjectMedia(project, media, request.mediaRole(), request.displayOrder()))); }
		catch (DataIntegrityViolationException exception) { throw new ApiException(HttpStatus.CONFLICT, "MEDIA_ATTACHMENT_CONFLICT", "Media role or attachment conflicts with an existing project image"); }
	}

	@Transactional(readOnly = true)
	public List<AdminProjectMediaResponse> projectMedia(UUID projectId) { requireProject(projectId); return projectMedia.findByProject_IdOrderByMediaRoleAscDisplayOrderAsc(projectId).stream().map(this::projectResponse).toList(); }

	@Transactional
	public List<AdminProjectMediaResponse> reorder(UUID projectId, ProjectMediaOrderRequest request) {
		requireProject(projectId); List<ProjectMedia> existing = projectMedia.findByProject_IdOrderByMediaRoleAscDisplayOrderAsc(projectId);
		if (request.items().size() != existing.size()) throw new ApiException(HttpStatus.BAD_REQUEST, "MEDIA_ORDER_INCOMPLETE", "Order request must contain every attached media item");
		var byId = new java.util.HashMap<UUID, ProjectMedia>(); existing.forEach(item -> byId.put(item.getId(), item));
		Set<UUID> seen = new HashSet<>();
		request.items().forEach(item -> { ProjectMedia entity = byId.get(item.projectMediaId()); if (entity == null || !seen.add(item.projectMediaId())) throw new ApiException(HttpStatus.BAD_REQUEST, "MEDIA_ORDER_INVALID", "Unknown or duplicate project media ID"); entity.reorder(entity.getMediaRole(), item.displayOrder()); });
		return existing.stream().sorted(java.util.Comparator.comparing(ProjectMedia::getMediaRole).thenComparingInt(ProjectMedia::getDisplayOrder)).map(this::projectResponse).toList();
	}

	@Transactional
	public void detach(UUID projectId, UUID projectMediaId) { ProjectMedia item = projectMedia.findByIdAndProject_Id(projectMediaId, projectId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_MEDIA_NOT_FOUND", "Project media not found")); projectMedia.delete(item); }

	@Transactional(readOnly = true)
	public MediaContent content(UUID id, boolean publicOnly) {
		MediaFile media = requireMedia(id); if (publicOnly && !projectMedia.isPubliclyUsed(id)) throw new ApiException(HttpStatus.NOT_FOUND, "MEDIA_NOT_FOUND", "Media not found");
		try { return new MediaContent(storage.read(media.getStorageKey()), media.getMimeType()); }
		catch (IOException exception) { throw storageError(exception); }
	}

	@Transactional(readOnly = true)
	public List<PublicMediaResponse> publicMedia(List<UUID> projectIds) {
		if (projectIds.isEmpty()) return List.of();
		return projectMedia.findForProjects(projectIds).stream().map(this::publicResponse).toList();
	}

	@Transactional(readOnly = true)
	public Map<UUID, List<PublicMediaResponse>> publicMediaByProject(List<UUID> projectIds) {
		Map<UUID, List<PublicMediaResponse>> result = new java.util.HashMap<>();
		if (projectIds.isEmpty()) return result;
		projectMedia.findForProjects(projectIds).forEach(item -> result.computeIfAbsent(item.getProject().getId(), ignored -> new ArrayList<>()).add(publicResponse(item)));
		return result;
	}

	@Transactional(readOnly = true)
	public List<PublicMediaResponse> publicMedia(UUID projectId) { return projectMedia.findByProject_IdOrderByMediaRoleAscDisplayOrderAsc(projectId).stream().map(this::publicResponse).toList(); }

	private AdminMediaResponse adminResponse(MediaFile media) { return new AdminMediaResponse(media.getId(), media.getOriginalName(), media.getMimeType(), media.getFileSize(), media.getWidth(), media.getHeight(), media.getAltText(), media.getCaption(), adminUrl(media.getId()), projectMedia.countByMedia_Id(media.getId()), media.getCreatedAt(), media.getUpdatedAt()); }
	private AdminProjectMediaResponse projectResponse(ProjectMedia item) { MediaFile media = item.getMedia(); return new AdminProjectMediaResponse(item.getId(), media.getId(), media.getOriginalName(), item.getMediaRole(), item.getDisplayOrder(), media.getAltText(), media.getCaption(), media.getWidth(), media.getHeight(), adminUrl(media.getId())); }
	private PublicMediaResponse publicResponse(ProjectMedia item) { MediaFile media = item.getMedia(); return new PublicMediaResponse(item.getMediaRole().name(), item.getDisplayOrder(), media.getAltText(), media.getCaption(), media.getWidth(), media.getHeight(), publicUrl(media.getId())); }
	private String adminUrl(UUID id) { return "/api/admin/media/" + id + "/content"; }
	private String publicUrl(UUID id) { return "/api/public/media/" + id + "/content"; }
	private MediaFile requireMedia(UUID id) { return mediaFiles.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MEDIA_NOT_FOUND", "Media not found")); }
	private Project requireProject(UUID id) { return projects.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found")); }
	private String safeOriginalName(String name) { if (name == null || name.isBlank()) throw badFile("MEDIA_NAME_INVALID", "File name is required"); String normalized = name.replace('\\', '/'); String result = normalized.substring(normalized.lastIndexOf('/') + 1).strip(); if (result.isBlank() || result.length() > 255) throw badFile("MEDIA_NAME_INVALID", "File name is invalid"); return result; }
	private String extension(String name) { int dot = name.lastIndexOf('.'); return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT); }
	private String detectMime(byte[] bytes) { if (bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47 && bytes[4] == 0x0d && bytes[5] == 0x0a && bytes[6] == 0x1a && bytes[7] == 0x0a) return "image/png"; if (bytes.length >= 3 && bytes[0] == (byte) 0xff && bytes[1] == (byte) 0xd8 && bytes[2] == (byte) 0xff) return "image/jpeg"; return ""; }
	private String nullable(String value) { return value == null || value.isBlank() ? null : value.strip(); }
	private ApiException badFile(String code, String message) { return new ApiException(HttpStatus.BAD_REQUEST, code, message); }
	private ApiException storageError(Exception exception) { return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "MEDIA_STORAGE_UNAVAILABLE", "Media storage is unavailable", exception); }
}
