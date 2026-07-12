package com.ympf.portfolio.resume.pdf;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.resume-pdf")
public record ResumePdfProperties(String fontPath) { public ResumePdfProperties { fontPath = fontPath == null ? "" : fontPath.strip(); } }
