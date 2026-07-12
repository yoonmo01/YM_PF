package com.ympf.portfolio.project;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

	Optional<Project> findBySlug(String slug);
	Optional<Project> findBySlugAndStatus(String slug, ProjectStatus status);
	boolean existsBySlugAndIdNot(String slug, UUID id);
	long countByStatus(ProjectStatus status);

	@Query("""
			select p from Project p
			where (:status is null or p.status = :status)
			and (:query is null or lower(p.title) like lower(concat('%', :query, '%'))
			     or lower(p.slug) like lower(concat('%', :query, '%')))
			""")
	Page<Project> searchAdmin(@Param("status") ProjectStatus status, @Param("query") String query, Pageable pageable);

	@Query("""
			select p from Project p
			where p.status = com.ympf.portfolio.project.ProjectStatus.PUBLISHED
			and (:featured is null or p.featured = :featured)
			and (:skillId is null or exists (
			  select ps.id from ProjectSkill ps
			  where ps.project = p and ps.skill.id = :skillId and ps.skill.visible = true
			))
			""")
	Page<Project> searchPublic(@Param("skillId") UUID skillId, @Param("featured") Boolean featured, Pageable pageable);
}
