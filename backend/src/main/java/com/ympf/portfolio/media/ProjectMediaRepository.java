package com.ympf.portfolio.media;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectMediaRepository extends JpaRepository<ProjectMedia, UUID> {
	List<ProjectMedia> findByProject_IdOrderByMediaRoleAscDisplayOrderAsc(UUID projectId);
	Optional<ProjectMedia> findByIdAndProject_Id(UUID id, UUID projectId);
	boolean existsByProject_IdAndMediaRole(UUID projectId, MediaRole role);
	long countByMedia_Id(UUID mediaId);
	@Query("select pm from ProjectMedia pm join fetch pm.media where pm.project.id in :ids order by pm.displayOrder")
	List<ProjectMedia> findForProjects(@Param("ids") List<UUID> projectIds);
	@Query("select count(pm) > 0 from ProjectMedia pm where pm.media.id = :mediaId and pm.project.status = com.ympf.portfolio.project.ProjectStatus.PUBLISHED")
	boolean isPubliclyUsed(@Param("mediaId") UUID mediaId);
}
