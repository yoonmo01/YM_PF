package com.ympf.portfolio.auth.service;

import com.ympf.portfolio.auth.dto.AuthUserResponse;

public record AuthTokens(String accessToken, String refreshToken, AuthUserResponse user) {
}
