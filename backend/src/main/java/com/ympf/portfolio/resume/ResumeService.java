package com.ympf.portfolio.resume;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.experience.Experience;
import com.ympf.portfolio.experience.ExperienceRepository;
import com.ympf.portfolio.media.MediaFile;
import com.ympf.portfolio.media.MediaFileRepository;
import com.ympf.portfolio.media.MediaService;
import com.ympf.portfolio.profile.Profile;
import com.ympf.portfolio.profile.ProfileRepository;
import com.ympf.portfolio.project.Project;
import com.ympf.portfolio.project.ProjectRepository;
import com.ympf.portfolio.resume.ResumeDtos.ExperienceItem;
import com.ympf.portfolio.resume.ResumeDtos.ExperienceSelectionRequest;
import com.ympf.portfolio.resume.ResumeDtos.ProjectItem;
import com.ympf.portfolio.resume.ResumeDtos.ProjectSelectionRequest;
import com.ympf.portfolio.resume.ResumeDtos.ResumeDetailResponse;
import com.ympf.portfolio.resume.ResumeDtos.ResumePdfResponse;
import com.ympf.portfolio.resume.ResumeDtos.ResumeRequest;
import com.ympf.portfolio.resume.ResumeDtos.ResumeSummaryResponse;
import com.ympf.portfolio.resume.ResumeDtos.SkillItem;
import com.ympf.portfolio.resume.ResumeDtos.SkillSelectionRequest;
import com.ympf.portfolio.resume.pdf.ResumePdfRenderer;
import com.ympf.portfolio.skill.Skill;
import com.ympf.portfolio.skill.SkillRepository;

@Service
public class ResumeService {
	private final ResumeRepository resumes; private final ResumeExperienceRepository resumeExperiences;
	private final ResumeProjectRepository resumeProjects; private final ResumeSkillRepository resumeSkills;
	private final ExperienceRepository experiences; private final ProjectRepository projects; private final SkillRepository skills;
	private final ProfileRepository profiles; private final MediaFileRepository mediaFiles; private final MediaService mediaService;
	private final ResumePdfRenderer pdfRenderer; private final Clock clock;
	public ResumeService(ResumeRepository resumes, ResumeExperienceRepository resumeExperiences,
			ResumeProjectRepository resumeProjects, ResumeSkillRepository resumeSkills, ExperienceRepository experiences,
			ProjectRepository projects, SkillRepository skills, ProfileRepository profiles, MediaFileRepository mediaFiles,
			MediaService mediaService, ResumePdfRenderer pdfRenderer, Clock clock) {
		this.resumes = resumes; this.resumeExperiences = resumeExperiences; this.resumeProjects = resumeProjects;
		this.resumeSkills = resumeSkills; this.experiences = experiences; this.projects = projects; this.skills = skills;
		this.profiles = profiles; this.mediaFiles = mediaFiles; this.mediaService = mediaService; this.pdfRenderer = pdfRenderer; this.clock = clock;
	}

	@Transactional(readOnly = true) public List<ResumeSummaryResponse> list() { return resumes.findAllByOrderByUpdatedAtDesc().stream().map(this::summary).toList(); }
	@Transactional(readOnly = true) public ResumeDetailResponse get(UUID id) { return detail(requireResume(id)); }

	@Transactional
	public ResumeDetailResponse create(ResumeRequest request) {
		validateSelections(request); Instant now = clock.instant();
		Resume resume = resumes.save(new Resume(clean(request.title()), clean(request.companyName()), clean(request.positionName()),
				nullable(request.jobPostingUrl()), request.deadline(), clean(request.customSummary()), profileMedia(request.profileMediaId()),
				nullable(request.notes()), now)); replaceSelections(resume, request); return detail(resume);
	}

	@Transactional
	public ResumeDetailResponse update(UUID id, ResumeRequest request) {
		Resume resume = requireResume(id); requireEditable(resume); validateSelections(request);
		resume.update(clean(request.title()), clean(request.companyName()), clean(request.positionName()), nullable(request.jobPostingUrl()),
				request.deadline(), clean(request.customSummary()), profileMedia(request.profileMediaId()), nullable(request.notes()), clock.instant());
		replaceSelections(resume, request); return detail(resume);
	}

	@Transactional
	public ResumeDetailResponse copy(UUID id) {
		Resume source = requireResume(id); Instant now = clock.instant();
		Resume copy = resumes.save(new Resume(source.getTitle() + " (복사본)", source.getCompanyName(), source.getPositionName(),
				source.getJobPostingUrl(), source.getDeadline(), source.getCustomSummary(), source.getProfileMedia(), source.getNotes(), now));
		resumeExperiences.findByResume_IdOrderByDisplayOrder(id).forEach(item -> resumeExperiences.save(new ResumeExperience(copy, item.getExperience(), item.getDisplayOrder(), item.getCustomDescription())));
		resumeProjects.findByResume_IdOrderByDisplayOrder(id).forEach(item -> resumeProjects.save(new ResumeProject(copy, item.getProject(), item.getDisplayOrder(), item.getCustomSummary())));
		resumeSkills.findByResume_IdOrderByDisplayOrder(id).forEach(item -> resumeSkills.save(new ResumeSkill(copy, item.getSkill(), item.getDisplayOrder())));
		return detail(copy);
	}

	@Transactional public ResumeDetailResponse ready(UUID id) { Resume resume = requireResume(id); if (resume.getStatus() != ResumeStatus.DRAFT) throw invalidState("Only a draft can become ready"); if (resumeExperiences.findByResume_IdOrderByDisplayOrder(id).isEmpty() && resumeProjects.findByResume_IdOrderByDisplayOrder(id).isEmpty()) throw invalidState("Select at least one experience or project"); if (resumeSkills.findByResume_IdOrderByDisplayOrder(id).isEmpty()) throw invalidState("Select at least one skill"); resume.ready(clock.instant()); return detail(resume); }
	@Transactional public ResumeDetailResponse submit(UUID id) { Resume resume = requireResume(id); if (resume.getStatus() != ResumeStatus.READY || resume.getPdfMedia() == null) throw invalidState("A ready resume with a generated PDF is required"); resume.submit(clock.instant()); return detail(resume); }
	@Transactional public ResumeDetailResponse archive(UUID id) { Resume resume = requireResume(id); if (resume.getStatus() == ResumeStatus.ARCHIVED) throw invalidState("Resume is already archived"); resume.archive(clock.instant()); return detail(resume); }

	@Transactional
	public ResumePdfResponse generatePdf(UUID id) {
		Resume resume = requireResume(id); if (resume.getStatus() == ResumeStatus.ARCHIVED) throw invalidState("Archived resumes cannot generate PDFs");
		Profile profile = profiles.findFirstByOrderByCreatedAtAsc().orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "PROFILE_REQUIRED", "Create a profile before generating a resume PDF"));
		byte[] pdf = pdfRenderer.render(detail(resume), profile); Instant now = clock.instant();
		String filename = safeFilename(resume.getCompanyName() + "-" + resume.getPositionName() + "-resume.pdf");
		MediaFile stored = mediaService.storeGeneratedPdf(filename, pdf, resume.getCompanyName() + " " + resume.getPositionName() + " 이력서 PDF");
		resume.setPdfMedia(stored, now); return new ResumePdfResponse(stored.getId(), "/api/admin/media/" + stored.getId() + "/content", filename, now);
	}

	@Transactional public void delete(UUID id) { Resume resume = requireResume(id); MediaFile pdf = resume.getPdfMedia(); resumes.delete(resume); resumes.flush(); if (pdf != null) mediaService.delete(pdf.getId()); }

	private void replaceSelections(Resume resume, ResumeRequest request) {
		resumeExperiences.deleteByResume_Id(resume.getId()); resumeProjects.deleteByResume_Id(resume.getId()); resumeSkills.deleteByResume_Id(resume.getId());
		resumeExperiences.flush(); resumeProjects.flush(); resumeSkills.flush();
		request.experiences().forEach(item -> resumeExperiences.save(new ResumeExperience(resume, requireExperience(item.experienceId()), item.displayOrder(), nullable(item.customDescription()))));
		request.projects().forEach(item -> resumeProjects.save(new ResumeProject(resume, requireProject(item.projectId()), item.displayOrder(), nullable(item.customSummary()))));
		request.skills().forEach(item -> resumeSkills.save(new ResumeSkill(resume, requireSkill(item.skillId()), item.displayOrder())));
	}

	private void validateSelections(ResumeRequest request) { unique(request.experiences(), ExperienceSelectionRequest::experienceId, "experience"); unique(request.projects(), ProjectSelectionRequest::projectId, "project"); unique(request.skills(), SkillSelectionRequest::skillId, "skill"); request.experiences().forEach(item -> requireExperience(item.experienceId())); request.projects().forEach(item -> requireProject(item.projectId())); request.skills().forEach(item -> requireSkill(item.skillId())); profileMedia(request.profileMediaId()); }
	private <T> void unique(List<T> values, Function<T, UUID> id, String type) { Set<UUID> unique = new HashSet<>(); if (values.stream().map(id).anyMatch(value -> !unique.add(value))) throw new ApiException(HttpStatus.BAD_REQUEST, "DUPLICATE_RESUME_SELECTION", "Duplicate " + type + " selection"); }
	private ResumeDetailResponse detail(Resume resume) { List<ExperienceItem> experienceItems = resumeExperiences.findByResume_IdOrderByDisplayOrder(resume.getId()).stream().map(item -> { Experience e = item.getExperience(); return new ExperienceItem(e.getId(), e.getOrganization(), e.getTitle(), item.getCustomDescription() == null ? e.getDescription() : item.getCustomDescription(), e.getStartDate(), e.getEndDate(), e.isCurrent(), item.getDisplayOrder()); }).toList(); List<ProjectItem> projectItems = resumeProjects.findByResume_IdOrderByDisplayOrder(resume.getId()).stream().map(item -> { Project p = item.getProject(); return new ProjectItem(p.getId(), p.getTitle(), item.getCustomSummary() == null ? p.getSummary() : item.getCustomSummary(), p.getRole(), p.getResults(), item.getDisplayOrder()); }).toList(); List<SkillItem> skillItems = resumeSkills.findByResume_IdOrderByDisplayOrder(resume.getId()).stream().map(item -> { Skill s = item.getSkill(); return new SkillItem(s.getId(), s.getName(), s.getCategory().name(), item.getDisplayOrder()); }).toList(); MediaFile profileMedia = resume.getProfileMedia(); MediaFile pdf = resume.getPdfMedia(); return new ResumeDetailResponse(resume.getId(), resume.getTitle(), resume.getCompanyName(), resume.getPositionName(), resume.getJobPostingUrl(), resume.getDeadline(), resume.getCustomSummary(), profileMedia == null ? null : profileMedia.getId(), profileMedia == null ? null : "/api/admin/media/" + profileMedia.getId() + "/content", resume.getNotes(), resume.getStatus(), pdf == null ? null : pdf.getId(), pdf == null ? null : "/api/admin/media/" + pdf.getId() + "/content", resume.getSubmittedAt(), resume.getCreatedAt(), resume.getUpdatedAt(), experienceItems, projectItems, skillItems); }
	private ResumeSummaryResponse summary(Resume resume) { return new ResumeSummaryResponse(resume.getId(), resume.getTitle(), resume.getCompanyName(), resume.getPositionName(), resume.getDeadline(), resume.getStatus(), resume.getPdfMedia() != null, resume.getSubmittedAt(), resume.getUpdatedAt()); }
	private Resume requireResume(UUID id) { return resumes.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "Resume not found")); }
	private Experience requireExperience(UUID id) { return experiences.findById(id).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "EXPERIENCE_NOT_FOUND", "Selected experience not found")); }
	private Project requireProject(UUID id) { return projects.findById(id).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "PROJECT_NOT_FOUND", "Selected project not found")); }
	private Skill requireSkill(UUID id) { return skills.findById(id).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "SKILL_NOT_FOUND", "Selected skill not found")); }
	private MediaFile profileMedia(UUID id) { if (id == null) return null; MediaFile media = mediaFiles.findById(id).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "MEDIA_NOT_FOUND", "Profile media not found")); if (!media.getMimeType().startsWith("image/")) throw new ApiException(HttpStatus.BAD_REQUEST, "PROFILE_MEDIA_INVALID", "Profile media must be an image"); return media; }
	private void requireEditable(Resume resume) { if (resume.getStatus() == ResumeStatus.SUBMITTED || resume.getStatus() == ResumeStatus.ARCHIVED) throw invalidState("Submitted or archived resumes cannot be edited"); }
	private ApiException invalidState(String message) { return new ApiException(HttpStatus.CONFLICT, "INVALID_RESUME_STATE", message); }
	private String clean(String value) { return value.strip(); } private String nullable(String value) { return value == null || value.isBlank() ? null : value.strip(); }
	private String safeFilename(String value) { String sanitized = value.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "-").replaceAll("-+", "-"); return sanitized.length() > 180 ? sanitized.substring(0, 176) + ".pdf" : sanitized; }
}
