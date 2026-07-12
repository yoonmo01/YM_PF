package com.ympf.portfolio.dashboard;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ympf.portfolio.certificate.CertificateRepository;
import com.ympf.portfolio.dashboard.DashboardDtos.DashboardResponse;
import com.ympf.portfolio.dashboard.DashboardDtos.RecentItem;
import com.ympf.portfolio.education.EducationRepository;
import com.ympf.portfolio.experience.ExperienceRepository;
import com.ympf.portfolio.profile.ProfileRepository;
import com.ympf.portfolio.project.ProjectRepository;
import com.ympf.portfolio.project.ProjectStatus;
import com.ympf.portfolio.skill.SkillRepository;

@Service
public class DashboardService {

	private final ProjectRepository projects;
	private final ProfileRepository profiles;
	private final ExperienceRepository experiences;
	private final EducationRepository educations;
	private final SkillRepository skills;
	private final CertificateRepository certificates;

	public DashboardService(ProjectRepository projects, ProfileRepository profiles,
			ExperienceRepository experiences, EducationRepository educations,
			SkillRepository skills, CertificateRepository certificates) {
		this.projects = projects; this.profiles = profiles; this.experiences = experiences;
		this.educations = educations; this.skills = skills; this.certificates = certificates;
	}

	@Transactional(readOnly = true)
	public DashboardResponse dashboard() {
		List<RecentItem> recent = new ArrayList<>();
		projects.findAll().forEach(item -> recent.add(new RecentItem("PROJECT", item.getId(), item.getTitle(), item.getUpdatedAt())));
		profiles.findAll().forEach(item -> recent.add(new RecentItem("PROFILE", item.getId(), item.getName(), item.getUpdatedAt())));
		experiences.findAll().forEach(item -> recent.add(new RecentItem("EXPERIENCE", item.getId(), item.getTitle(), item.getUpdatedAt())));
		educations.findAll().forEach(item -> recent.add(new RecentItem("EDUCATION", item.getId(), item.getProgram(), item.getUpdatedAt())));
		skills.findAll().forEach(item -> recent.add(new RecentItem("SKILL", item.getId(), item.getName(), item.getUpdatedAt())));
		certificates.findAll().forEach(item -> recent.add(new RecentItem("CERTIFICATE", item.getId(), item.getName(), item.getUpdatedAt())));
		List<RecentItem> top = recent.stream().sorted(Comparator.comparing(RecentItem::updatedAt).reversed()).limit(10).toList();
		return new DashboardResponse(projects.countByStatus(ProjectStatus.PUBLISHED),
				projects.countByStatus(ProjectStatus.DRAFT), 0, 0, top);
	}
}
