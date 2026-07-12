package com.ympf.portfolio.resume;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {
	List<Resume> findAllByOrderByUpdatedAtDesc();
	long countByStatus(ResumeStatus status);
}
