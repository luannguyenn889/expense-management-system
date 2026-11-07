package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.GoogleLoginRequest;
import com.expensemanagement.backend.DTO.request.LoginRequest;
import com.expensemanagement.backend.DTO.response.LoginResponse;
import com.expensemanagement.backend.DTO.response.UserResponse;
import com.expensemanagement.backend.entity.User;
import com.expensemanagement.backend.exception.UnauthorizedException;
import com.expensemanagement.backend.repository.UserRepository;
import com.expensemanagement.backend.util.GoogleAuthVerifier;
import com.expensemanagement.backend.util.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleAuthVerifier googleAuthVerifier;
    private final long expirationTime;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            GoogleAuthVerifier googleAuthVerifier,
            @Value("${jwt.expiration:86400000}") long expirationTime
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleAuthVerifier = googleAuthVerifier;
        this.expirationTime = expirationTime;
    }

    public LoginResponse login(LoginRequest request) {
        String rawIdentifier = request.getIdentifier();
        if (rawIdentifier == null || rawIdentifier.isBlank()) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        String normalizedIdentifier = rawIdentifier.toLowerCase();

        // Tìm theo Email hoặc Tên đăng nhập (Username)
        User user = userRepository.findByEmailOrUsername(normalizedIdentifier, normalizedIdentifier)
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        String token = jwtTokenProvider.generateToken(user.getUserId());

        UserResponse userResponse = UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(expirationTime / 1000)
                .user(userResponse)
                .build();
    }

    @Transactional
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken idToken = googleAuthVerifier.verify(request.getIdToken());
        if (idToken == null) {
            throw new UnauthorizedException("Google ID Token không hợp lệ hoặc đã hết hạn");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Không thể lấy thông tin email từ Google");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String name = (String) payload.get("name");
        if (name == null || name.isBlank()) {
            name = normalizedEmail.split("@")[0];
        }

        final String finalName = name;
        // Nếu user chưa tồn tại -> tự động tạo tài khoản mới (JIT Provisioning)
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    String baseUsername = normalizedEmail.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
                    if (baseUsername.length() < 3) {
                        baseUsername = "user_" + baseUsername;
                    }
                    String generatedUsername = baseUsername;
                    if (userRepository.existsByUsername(generatedUsername)) {
                        generatedUsername = baseUsername + "_" + UUID.randomUUID().toString().substring(0, 5);
                    }

                    User newUser = User.builder()
                            .username(generatedUsername)
                            .fullName(finalName)
                            .email(normalizedEmail)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .build();
                    return userRepository.save(newUser);
                });

        String token = jwtTokenProvider.generateToken(user.getUserId());

        UserResponse userResponse = UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(expirationTime / 1000)
                .user(userResponse)
                .build();
    }
}
