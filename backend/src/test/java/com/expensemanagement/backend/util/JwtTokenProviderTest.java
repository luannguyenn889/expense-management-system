package com.expensemanagement.backend.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "mySecretKeyForTestingJwtTokenGenerationMustBeVeryLong123456789";
    private final long expirationTime = 3600000; // 1 giờ

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expirationTime);
    }

    @Test
    @DisplayName("Tạo token thành công và trích xuất đúng userId từ token")
    void generateToken_thenGetUserIdFromToken_shouldReturnSameUserId() {
        // Arrange
        Long expectedUserId = 123L;

        // Act
        String token = jwtTokenProvider.generateToken(expectedUserId);
        Long actualUserId = jwtTokenProvider.getUserIdFromToken(token);

        // Assert
        assertThat(token).isNotNull().isNotEmpty();
        assertThat(actualUserId).isEqualTo(expectedUserId);
    }

    @Test
    @DisplayName("Validate token hợp lệ trả về true")
    void validateToken_withValidToken_shouldReturnTrue() {
        // Arrange
        String token = jwtTokenProvider.generateToken(999L);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Validate token giả mạo hoặc sai chữ ký trả về false")
    void validateToken_withTamperedToken_shouldReturnFalse() {
        // Arrange
        String fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(fakeToken);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Validate token đã hết hạn trả về false")
    void validateToken_withExpiredToken_shouldReturnFalse() {
        // Arrange
        JwtTokenProvider expiredProvider = new JwtTokenProvider(secret, -1000L);
        String expiredToken = expiredProvider.generateToken(100L);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(expiredToken);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Validate token bị chỉnh sửa phần chữ ký trả về false")
    void validateToken_withModifiedSignature_shouldReturnFalse() {
        // Arrange
        String validToken = jwtTokenProvider.generateToken(100L);
        String tamperedToken = validToken.substring(0, validToken.length() - 4) + "abcd";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Validate token null, rỗng hoặc sai cấu trúc JWT trả về false")
    void validateToken_withNullOrEmptyOrMalformedToken_shouldReturnFalse() {
        // Act & Assert
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken("   ")).isFalse();
        assertThat(jwtTokenProvider.validateToken("not-a-jwt-token")).isFalse();
    }
}

