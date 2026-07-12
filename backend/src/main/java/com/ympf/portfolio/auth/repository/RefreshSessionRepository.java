package com.ympf.portfolio.auth.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ympf.portfolio.auth.domain.RefreshSession;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, UUID> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select session from RefreshSession session join fetch session.user "
			+ "where session.tokenHash = :tokenHash")
	Optional<RefreshSession> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

	Optional<RefreshSession> findByTokenHash(String tokenHash);
}
