package com.ympf.portfolio.skill;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, UUID> {
	List<Skill> findAllByOrderByCategoryAscDisplayOrderAscNameAsc();
	List<Skill> findAllByVisibleTrueOrderByCategoryAscDisplayOrderAscNameAsc();
	Optional<Skill> findByNameIgnoreCase(String name);
}
