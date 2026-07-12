package com.ympf.portfolio.project;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, ProjectSkillId> {

	@Query("select ps from ProjectSkill ps join fetch ps.skill where ps.project.id in :projectIds order by ps.displayOrder")
	List<ProjectSkill> findForProjects(@Param("projectIds") Collection<UUID> projectIds);

	List<ProjectSkill> findByProject_IdOrderByDisplayOrder(UUID projectId);
	void deleteByProject_Id(UUID projectId);
	long countBySkill_Id(UUID skillId);
}
