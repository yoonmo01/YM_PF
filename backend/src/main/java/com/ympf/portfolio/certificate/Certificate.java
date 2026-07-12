package com.ympf.portfolio.certificate;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "certificates")
public class Certificate extends AuditedEntity {

	@Column(nullable = false, length = 200)
	private String name;
	@Column(nullable = false, length = 160)
	private String issuer;
	@Column(name = "issued_date", nullable = false)
	private LocalDate issuedDate;
	@Column(name = "expires_date")
	private LocalDate expiresDate;
	@Column(name = "credential_url", length = 500)
	private String credentialUrl;
	@Column(length = 100)
	private String score;
	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	protected Certificate() {}

	public Certificate(String name, String issuer, LocalDate issuedDate, LocalDate expiresDate,
			String credentialUrl, String score, int displayOrder, Instant now) {
		super(now);
		update(name, issuer, issuedDate, expiresDate, credentialUrl, score, displayOrder, now);
	}

	public void update(String name, String issuer, LocalDate issuedDate, LocalDate expiresDate,
			String credentialUrl, String score, int displayOrder, Instant now) {
		this.name = name;
		this.issuer = issuer;
		this.issuedDate = issuedDate;
		this.expiresDate = expiresDate;
		this.credentialUrl = credentialUrl;
		this.score = score;
		this.displayOrder = displayOrder;
		touch(now);
	}

	public String getName() { return name; }
	public String getIssuer() { return issuer; }
	public LocalDate getIssuedDate() { return issuedDate; }
	public LocalDate getExpiresDate() { return expiresDate; }
	public String getCredentialUrl() { return credentialUrl; }
	public String getScore() { return score; }
	public int getDisplayOrder() { return displayOrder; }
}
