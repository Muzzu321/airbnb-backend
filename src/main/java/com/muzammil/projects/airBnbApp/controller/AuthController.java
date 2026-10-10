package com.muzammil.projects.airBnbApp.controller;

import com.muzammil.projects.airBnbApp.dto.LoginDto;
import com.muzammil.projects.airBnbApp.dto.LoginResponseDto;
import com.muzammil.projects.airBnbApp.dto.SignUpRequestDto;
import com.muzammil.projects.airBnbApp.dto.UserDto;
import com.muzammil.projects.airBnbApp.security.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Arrays;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/signup")
    @Operation(summary = "Create a new account", tags = {"Auth"})
    public ResponseEntity<UserDto> signup(@Valid @RequestBody SignUpRequestDto signUpRequestDto) {
        return new ResponseEntity<>(authService.signUp(signUpRequestDto), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login request", tags = {"Auth"})
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginDto loginDto, HttpServletRequest request) {
        String[] tokens = authService.login(loginDto);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(request, tokens[1], Duration.ofDays(180)).toString())
                .body(new LoginResponseDto(tokens[0]));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh the JWT with a refresh token", tags = {"Auth"})
    public ResponseEntity<LoginResponseDto> refresh(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String refreshToken = cookies == null ? null : Arrays.stream(cookies)
                .filter(cookie -> REFRESH_COOKIE.equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthenticationServiceException("Refresh token not found inside the Cookies");
        }

        String accessToken = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(new LoginResponseDto(accessToken));
    }

    /**
     * Clears the HttpOnly refresh cookie (JavaScript cannot do this itself).
     * Tokens are stateless JWTs: this does not revoke an access token that was already issued
     * (it simply expires after 10 minutes).
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout: clears the refresh-token cookie", tags = {"Auth"})
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(request, "", Duration.ZERO).toString())
                .build();
    }

    private ResponseCookie refreshCookie(HttpServletRequest request, String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path(request.getContextPath() + "/auth")
                .maxAge(maxAge)
                .build();
    }

}
