package com.ympf.portfolio.resume;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeSkillRepository extends JpaRepository<ResumeSkill, ResumeSkillId> {
	List<ResumeSkill> findByResume_IdOrderByDisplayOrder(UUID resumeId);
	void deleteByResume_Id(UUID resumeId);
}
