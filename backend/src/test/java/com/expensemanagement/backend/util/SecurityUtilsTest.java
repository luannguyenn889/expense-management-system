package com.expensemanagement.backend.util;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityUtilsTest {

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("getCurrentUserId khi đã xác thực với Principal kiểu Long -> Trả về đúng userId")
    void getCurrentUserId_whenAuthenticatedWithLongPrincipal_shouldReturnUserId() {
        // 1. Arrange (Given)
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(15L, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        // 2. Act (When)
        Long userId = SecurityUtils.getCurrentUserId();

        // 3. Assert (Then)
        assertThat(userId).isEqualTo(15L);
    }

    @Test
    @DisplayName("getCurrentUserId khi Principal là chuỗi số -> Parse và trả về đúng Long userId")
    void getCurrentUserId_whenAuthenticatedWithNumericStringPrincipal_shouldParseAndReturnUserId() {
        // 1. Arrange (Given)
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("2026", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        // 2. Act (When)
        Long userId = SecurityUtils.getCurrentUserId();

        // 3. Assert (Then)
        assertThat(userId).isEqualTo(2026L);
    }

    @Test
    @DisplayName("getCurrentUserId khi chưa đăng nhập, anonymousUser hoặc principal không phải số -> Trả về null")
    void getCurrentUserId_whenUnauthenticatedOrAnonymous_shouldReturnNull() {
        // Case 1: SecurityContext trống
        assertThat(SecurityUtils.getCurrentUserId()).isNull();

        // Case 2: anonymousUser
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("anonymousUser", null, Collections.emptyList())
        );
        assertThat(SecurityUtils.getCurrentUserId()).isNull();

        // Case 3: Principal là chuỗi không phải số
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("not-a-number", null, Collections.emptyList())
        );
        assertThat(SecurityUtils.getCurrentUserId()).isNull();
    }

    @Test
    @DisplayName("getCurrentUserId khi Authentication có isAuthenticated = false -> Trả về null")
    void getCurrentUserId_whenAuthenticationIsNotAuthenticated_shouldReturnNull() {
        // 1. Arrange (Given)
        UsernamePasswordAuthenticationToken unauthenticatedAuth =
                new UsernamePasswordAuthenticationToken(15L, null);
        unauthenticatedAuth.setAuthenticated(false);
        SecurityContextHolder.getContext().setAuthentication(unauthenticatedAuth);

        // 2. Act (When)
        Long userId = SecurityUtils.getCurrentUserId();

        // 3. Assert (Then)
        assertThat(userId).isNull();
    }
}
