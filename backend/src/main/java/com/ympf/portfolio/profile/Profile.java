package com.ympf.portfolio.profile;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.common.persistence.AuditedEntity;

@Entity
@Table(name = "profiles")
public class Profile extends AuditedEntity {

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false, length = 160)
	private String headline;

	@Column(name = "short_bio", nullable = false, length = 500)
	private String shortBio;

	@Column(name = "long_bio", nullable = false, columnDefinition = "text")
	private String longBio;

	@Column(nullable = false, length = 254)
	private String email;

	@Column(name = "github_url", length = 500)
	private String githubUrl;

	@Column(name = "linkedin_url", length = 500)
	private String linkedinUrl;

	protected Profile() {
	}

	public Profile(User user, String name, String headline, String shortBio, String longBio,
			String email, String githubUrl, String linkedinUrl, Instant now) {
		super(now);
		this.user = user;
		update(name, headline, shortBio, longBio, email, githubUrl, linkedinUrl, now);
	}

	public void update(String name, String headline, String shortBio, String longBio,
			String email, String githubUrl, String linkedinUrl, Instant now) {
		this.name = name;
		this.headline = headline;
		this.shortBio = shortBio;
		this.longBio = longBio;
		this.email = email;
		this.githubUrl = githubUrl;
		this.linkedinUrl = linkedinUrl;
		touch(now);
	}

	public String getName() { return name; }
	public String getHeadline() { return headline; }
	public String getShortBio() { return shortBio; }
	public String getLongBio() { return longBio; }
	public String getEmail() { return email; }
	public String getGithubUrl() { return githubUrl; }
	public String getLinkedinUrl() { return linkedinUrl; }
}
