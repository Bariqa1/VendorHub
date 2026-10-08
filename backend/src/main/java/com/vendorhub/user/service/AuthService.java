package com.vendorhub.user.service;

import com.vendorhub.security.JwtTokenProvider;
import com.vendorhub.security.UserPrincipal;
import com.vendorhub.user.dto.LoginRequest;
import com.vendorhub.user.dto.LoginResponse;
import com.vendorhub.user.dto.UserSummaryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        var roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        UserSummaryDTO userSummary = UserSummaryDTO.builder()
                .publicId(principal.getPublicId())
                .username(principal.getUsername())
                .fullName(principal.getFullName())
                .email(principal.getEmail())
                .roles(roles)
                .build();

        return LoginResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(userSummary)
                .build();
    }
}
