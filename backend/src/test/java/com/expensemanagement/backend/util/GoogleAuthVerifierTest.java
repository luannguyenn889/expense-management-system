package com.expensemanagement.backend.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.GeneralSecurityException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GoogleAuthVerifierTest {

    private GoogleAuthVerifier googleAuthVerifier;

    @BeforeEach
    void setUp() {
        googleAuthVerifier = new GoogleAuthVerifier(GoogleAuthVerifier.GOOGLE_CLIENT_ID);
    }

    @Test
    @DisplayName("verify(null) -> Bắt ngoại lệ an toàn và trả về null")
    void verify_whenTokenIsNull_shouldReturnNullSafely() {
        // 2. Act (When)
        GoogleIdToken result = googleAuthVerifier.verify(null);

        // 3. Assert (Then)
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("verify với token rỗng hoặc sai cấu trúc JWT -> Trả về null")
    void verify_whenTokenIsEmptyOrMalformed_shouldReturnNull() {
        // 2. Act (When) & 3. Assert (Then)
        assertThat(googleAuthVerifier.verify("")).isNull();
        assertThat(googleAuthVerifier.verify("not.a.valid.google.token")).isNull();
    }

    @Test
    @DisplayName("verify khi GoogleIdTokenVerifier trả về token hợp lệ -> Trả về đúng GoogleIdToken")
    void verify_whenUnderlyingVerifierReturnsToken_shouldReturnGoogleIdToken() throws Exception {
        // 1. Arrange (Given)
        GoogleIdTokenVerifier mockVerifier = mock(GoogleIdTokenVerifier.class);
        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        when(mockVerifier.verify("valid.google.token")).thenReturn(mockIdToken);
        ReflectionTestUtils.setField(googleAuthVerifier, "verifier", mockVerifier);

        // 2. Act (When)
        GoogleIdToken result = googleAuthVerifier.verify("valid.google.token");

        // 3. Assert (Then)
        assertThat(result).isSameAs(mockIdToken);
        verify(mockVerifier, times(1)).verify("valid.google.token");
    }

    @Test
    @DisplayName("verify khi GoogleIdTokenVerifier ném GeneralSecurityException -> Bắt lỗi và trả về null")
    void verify_whenUnderlyingVerifierThrowsSecurityException_shouldReturnNull() throws Exception {
        // 1. Arrange (Given)
        GoogleIdTokenVerifier mockVerifier = mock(GoogleIdTokenVerifier.class);
        when(mockVerifier.verify("bad.signature.token"))
                .thenThrow(new GeneralSecurityException("Invalid Google signature"));
        ReflectionTestUtils.setField(googleAuthVerifier, "verifier", mockVerifier);

        // 2. Act (When)
        GoogleIdToken result = googleAuthVerifier.verify("bad.signature.token");

        // 3. Assert (Then)
        assertThat(result).isNull();
        verify(mockVerifier, times(1)).verify("bad.signature.token");
    }
}
