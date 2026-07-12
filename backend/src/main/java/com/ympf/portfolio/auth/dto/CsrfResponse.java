package com.ympf.portfolio.auth.dto;

public record CsrfResponse(String headerName, String token) {
}
