package com.ympf.portfolio.project;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectProblemSolutionRepository extends JpaRepository<ProjectProblemSolution, UUID> {
	List<ProjectProblemSolution> findByProject_IdOrderByDisplayOrder(UUID projectId);
	void deleteByProject_Id(UUID projectId);
}
