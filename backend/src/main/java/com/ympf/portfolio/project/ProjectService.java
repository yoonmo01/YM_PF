package com.ympf.portfolio.project;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.common.response.FieldErrorResponse;
import com.ympf.portfolio.common.response.PageResponse;
import com.ympf.portfolio.media.MediaDtos.PublicMediaResponse;
import com.ympf.portfolio.media.MediaService;
import com.ympf.portfolio.project.ProjectDtos.AdminProjectDetail;
import com.ympf.portfolio.project.ProjectDtos.AdminProjectSummary;
import com.ympf.portfolio.project.ProjectDtos.ProblemSolutionRequest;
import com.ympf.portfolio.project.ProjectDtos.ProblemSolutionResponse;
import com.ympf.portfolio.project.ProjectDtos.ProjectRequest;
import com.ympf.portfolio.project.ProjectDtos.PublicProjectDetail;
import com.ympf.portfolio.project.ProjectDtos.PublicProjectSummary;
import com.ympf.portfolio.project.ProjectDtos.PublicProblemSolution;
import com.ympf.portfolio.project.ProjectDtos.PublicSkillItem;
import com.ympf.portfolio.project.ProjectDtos.SkillItem;
import com.ympf.portfolio.skill.Skill;
import com.ympf.portfolio.skill.SkillRepository;

@Service
public class ProjectService {

	private final ProjectRepository projects;
	private final ProjectSkillRepository projectSkills;
	private final ProjectProblemSolutionRepository problemSolutions;
	private final SkillRepository skills;
	private final MediaService mediaService;
	private final Clock clock;

	public ProjectService(ProjectRepository projects, ProjectSkillRepository projectSkills,
			ProjectProblemSolutionRepository problemSolutions, SkillRepository skills, MediaService mediaService, Clock clock) {
		this.projects = projects;
		this.projectSkills = projectSkills;
		this.problemSolutions = problemSolutions;
		this.skills = skills;
		this.mediaService = mediaService;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public PageResponse<AdminProjectSummary> adminProjects(int page, int size, ProjectStatus status, String query) {
		Page<Project> result = projects.searchAdmin(status, nullable(query), PageRequest.of(page, size,
				Sort.by(Sort.Order.asc("displayOrder"), Sort.Order.desc("updatedAt"))));
		Map<UUID, List<SkillItem>> skillMap = skillMap(result.getContent(), false);
		List<AdminProjectSummary> content = result.getContent().stream()
				.map(project -> new AdminProjectSummary(project.getId(), project.getSlug(), project.getTitle(),
						project.getSummary(), project.getStatus(), project.isFeatured(), project.getDisplayOrder(),
						project.getStartDate(), project.getUpdatedAt(), skillMap.getOrDefault(project.getId(), List.of())))
				.toList();
		return PageResponse.from(result, content);
	}

	@Transactional(readOnly = true)
	public AdminProjectDetail adminProject(UUID id) {
		Project project = projects.findById(id).orElseThrow(this::notFound);
		return adminDetail(project);
	}

	@Transactional
	public AdminProjectDetail create(ProjectRequest request) {
		validateRequest(request, null);
		Instant now = clock.instant();
		Project project = new Project(clean(request.slug()), clean(request.title()), clean(request.summary()),
				text(request.background()), text(request.problem()), text(request.goal()), text(request.role()),
				text(request.responsibilities()), text(request.implementation()), text(request.technicalDecisions()),
				text(request.results()), text(request.limitations()), text(request.retrospective()), request.startDate(),
				request.endDate(), request.teamSize(), nullable(request.githubUrl()), nullable(request.demoUrl()),
				request.featured(), request.displayOrder(), now);
		projects.save(project);
		replaceChildren(project, request);
		return adminDetail(project);
	}

	@Transactional
	public AdminProjectDetail update(UUID id, ProjectRequest request) {
		Project project = projects.findById(id).orElseThrow(this::notFound);
		validateRequest(request, id);
		project.update(clean(request.slug()), clean(request.title()), clean(request.summary()), text(request.background()),
				text(request.problem()), text(request.goal()), text(request.role()), text(request.responsibilities()),
				text(request.implementation()), text(request.technicalDecisions()), text(request.results()),
				text(request.limitations()), text(request.retrospective()), request.startDate(), request.endDate(),
				request.teamSize(), nullable(request.githubUrl()), nullable(request.demoUrl()), request.featured(),
				request.displayOrder(), clock.instant());
		replaceChildren(project, request);
		return adminDetail(project);
	}

	@Transactional
	public AdminProjectDetail publish(UUID id) {
		Project project = projects.findById(id).orElseThrow(this::notFound);
		if (project.getStatus() == ProjectStatus.PUBLISHED) {
			throw new ApiException(HttpStatus.CONFLICT, "INVALID_PROJECT_STATE", "Project is already published");
		}
		List<FieldErrorResponse> missing = publishErrors(project);
		if (!missing.isEmpty()) {
			throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "PROJECT_NOT_PUBLISHABLE",
					"Project is not ready to publish", missing);
		}
		project.publish(clock.instant());
		return adminDetail(project);
	}

	@Transactional
	public AdminProjectDetail archive(UUID id) {
		Project project = projects.findById(id).orElseThrow(this::notFound);
		if (project.getStatus() == ProjectStatus.ARCHIVED) {
			throw new ApiException(HttpStatus.CONFLICT, "INVALID_PROJECT_STATE", "Project is already archived");
		}
		project.archive(clock.instant());
		return adminDetail(project);
	}

	@Transactional
	public void delete(UUID id) {
		if (!projects.existsById(id)) throw notFound();
		projects.deleteById(id);
	}

	@Transactional(readOnly = true)
	public PageResponse<PublicProjectSummary> publicProjects(int page, int size, UUID skillId, Boolean featured) {
		Page<Project> result = projects.searchPublic(skillId, featured, PageRequest.of(page, size,
				Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.desc("startDate"))));
		Map<UUID, List<PublicSkillItem>> skillMap = publicSkillMap(result.getContent());
		Map<UUID, List<PublicMediaResponse>> mediaMap = mediaService.publicMediaByProject(result.getContent().stream().map(Project::getId).toList());
		List<PublicProjectSummary> content = result.getContent().stream()
				.map(project -> new PublicProjectSummary(project.getSlug(), project.getTitle(), project.getSummary(),
						project.getRole(), project.getResults(), project.isFeatured(), project.getStartDate(),
						skillMap.getOrDefault(project.getId(), List.of()), mediaMap.getOrDefault(project.getId(), List.of())))
				.toList();
		return PageResponse.from(result, content);
	}

	@Transactional(readOnly = true)
	public PublicProjectDetail publicProject(String slug) {
		Project project = projects.findBySlugAndStatus(slug, ProjectStatus.PUBLISHED).orElseThrow(this::notFound);
		List<PublicSkillItem> skillItems = projectSkills.findByProject_IdOrderByDisplayOrder(project.getId()).stream()
				.filter(item -> item.getSkill().isVisible()).map(item -> publicSkillItem(item.getSkill())).toList();
		return new PublicProjectDetail(project.getSlug(), project.getTitle(), project.getSummary(), project.getBackground(),
				project.getProblem(), project.getGoal(), project.getRole(), project.getResponsibilities(),
				project.getImplementation(), project.getTechnicalDecisions(), project.getResults(), project.getLimitations(),
				project.getRetrospective(), project.getStartDate(), project.getEndDate(), project.getTeamSize(),
				project.getGithubUrl(), project.getDemoUrl(), skillItems, publicProblemResponses(project.getId()),
				mediaService.publicMedia(project.getId()));
	}

	private void replaceChildren(Project project, ProjectRequest request) {
		List<Skill> selectedSkills = loadSkills(request.skillIds());
		projectSkills.deleteByProject_Id(project.getId());
		problemSolutions.deleteByProject_Id(project.getId());
		projectSkills.flush();
		problemSolutions.flush();
		for (int index = 0; index < selectedSkills.size(); index++) {
			projectSkills.save(new ProjectSkill(project, selectedSkills.get(index), index));
		}
		for (int index = 0; index < request.problemSolutions().size(); index++) {
			ProblemSolutionRequest item = request.problemSolutions().get(index);
			problemSolutions.save(new ProjectProblemSolution(project, clean(item.problem()), clean(item.cause()),
					clean(item.solution()), clean(item.verification()), index));
		}
	}

	private void validateRequest(ProjectRequest request, UUID id) {
		if (request.endDate() != null && request.startDate() != null && request.endDate().isBefore(request.startDate())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "endDate precedes startDate");
		}
		if (id == null ? projects.findBySlug(clean(request.slug())).isPresent()
				: projects.existsBySlugAndIdNot(clean(request.slug()), id)) {
			throw new ApiException(HttpStatus.CONFLICT, "PROJECT_SLUG_CONFLICT", "Project slug already exists");
		}
		Set<UUID> unique = new HashSet<>(request.skillIds());
		if (unique.size() != request.skillIds().size()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "DUPLICATE_SKILL", "Project skill IDs must be unique");
		}
		loadSkills(request.skillIds());
	}

	private List<Skill> loadSkills(List<UUID> ids) {
		if (ids.isEmpty()) return List.of();
		Map<UUID, Skill> byId = new HashMap<>();
		skills.findAllById(ids).forEach(skill -> byId.put(skill.getId(), skill));
		if (byId.size() != ids.size()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "SKILL_NOT_FOUND", "One or more skills do not exist");
		}
		return ids.stream().map(byId::get).toList();
	}

	private List<FieldErrorResponse> publishErrors(Project project) {
		List<FieldErrorResponse> errors = new ArrayList<>();
		requireText(errors, "background", project.getBackground()); requireText(errors, "problem", project.getProblem());
		requireText(errors, "goal", project.getGoal()); requireText(errors, "role", project.getRole());
		requireText(errors, "responsibilities", project.getResponsibilities());
		requireText(errors, "implementation", project.getImplementation());
		requireText(errors, "technicalDecisions", project.getTechnicalDecisions());
		requireText(errors, "results", project.getResults()); requireText(errors, "limitations", project.getLimitations());
		requireText(errors, "retrospective", project.getRetrospective());
		if (project.getStartDate() == null) errors.add(new FieldErrorResponse("startDate", "is required to publish"));
		if (project.getTeamSize() == null) errors.add(new FieldErrorResponse("teamSize", "is required to publish"));
		boolean visibleSkill = projectSkills.findByProject_IdOrderByDisplayOrder(project.getId()).stream()
				.anyMatch(item -> item.getSkill().isVisible());
		if (!visibleSkill) errors.add(new FieldErrorResponse("skillIds", "must include a visible skill"));
		return errors;
	}

	private void requireText(List<FieldErrorResponse> errors, String field, String value) {
		if (!StringUtils.hasText(value)) errors.add(new FieldErrorResponse(field, "is required to publish"));
	}

	private AdminProjectDetail adminDetail(Project project) {
		List<SkillItem> skillItems = projectSkills.findByProject_IdOrderByDisplayOrder(project.getId()).stream()
				.map(item -> skillItem(item.getSkill())).toList();
		return new AdminProjectDetail(project.getId(), project.getSlug(), project.getTitle(), project.getSummary(),
				project.getBackground(), project.getProblem(), project.getGoal(), project.getRole(),
				project.getResponsibilities(), project.getImplementation(), project.getTechnicalDecisions(),
				project.getResults(), project.getLimitations(), project.getRetrospective(), project.getStartDate(),
				project.getEndDate(), project.getTeamSize(), project.getGithubUrl(), project.getDemoUrl(),
				project.getStatus(), project.isFeatured(), project.getDisplayOrder(), project.getCreatedAt(),
				project.getUpdatedAt(), skillItems, problemResponses(project.getId()));
	}

	private List<ProblemSolutionResponse> problemResponses(UUID projectId) {
		return problemSolutions.findByProject_IdOrderByDisplayOrder(projectId).stream()
				.map(item -> new ProblemSolutionResponse(item.getId(), item.getProblem(), item.getCause(),
						item.getSolution(), item.getVerification(), item.getDisplayOrder())).toList();
	}

	private List<PublicProblemSolution> publicProblemResponses(UUID projectId) {
		return problemSolutions.findByProject_IdOrderByDisplayOrder(projectId).stream()
				.map(item -> new PublicProblemSolution(item.getProblem(), item.getCause(), item.getSolution(),
						item.getVerification())).toList();
	}

	private Map<UUID, List<SkillItem>> skillMap(List<Project> projectList, boolean visibleOnly) {
		Map<UUID, List<SkillItem>> result = new HashMap<>();
		if (projectList.isEmpty()) return result;
		List<UUID> ids = projectList.stream().map(Project::getId).toList();
		for (ProjectSkill relation : projectSkills.findForProjects(ids)) {
			if (!visibleOnly || relation.getSkill().isVisible()) {
				result.computeIfAbsent(relation.getProject().getId(), ignored -> new ArrayList<>())
						.add(skillItem(relation.getSkill()));
			}
		}
		return result;
	}

	private Map<UUID, List<PublicSkillItem>> publicSkillMap(List<Project> projectList) {
		Map<UUID, List<PublicSkillItem>> result = new HashMap<>();
		if (projectList.isEmpty()) return result;
		List<UUID> ids = projectList.stream().map(Project::getId).toList();
		for (ProjectSkill relation : projectSkills.findForProjects(ids)) {
			if (relation.getSkill().isVisible()) {
				result.computeIfAbsent(relation.getProject().getId(), ignored -> new ArrayList<>())
						.add(publicSkillItem(relation.getSkill()));
			}
		}
		return result;
	}

	private SkillItem skillItem(Skill skill) { return new SkillItem(skill.getId(), skill.getName(), skill.getCategory()); }
	private PublicSkillItem publicSkillItem(Skill skill) { return new PublicSkillItem(skill.getName(), skill.getCategory()); }
	private ApiException notFound() { return new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"); }
	private String clean(String value) { return value.strip(); }
	private String text(String value) { return value == null ? "" : value.strip(); }
	private String nullable(String value) { return value == null || value.isBlank() ? null : value.strip(); }
}
