package com.expensemanagement.backend.config;

import com.expensemanagement.backend.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        jwtTokenProvider = mock(JwtTokenProvider.class);
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtTokenProvider);
        filterChain = mock(FilterChain.class);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Request không có header Authorization -> Đi qua filter và giữ SecurityContext rỗng")
    void doFilterInternal_withoutAuthorizationHeader_shouldLeaveSecurityContextEmpty() throws ServletException, IOException {
        // 1. Arrange (Given)
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        // 2. Act (When)
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // 3. Assert (Then)
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, times(1)).doFilter(request, response);
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    @DisplayName("Header Authorization không bắt đầu bằng Bearer -> Bỏ qua xác thực và giữ SecurityContext rỗng")
    void doFilterInternal_withNonBearerAuthorizationHeader_shouldLeaveSecurityContextEmpty() throws ServletException, IOException {
        // 1. Arrange (Given)
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // 2. Act (When)
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // 3. Assert (Then)
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, times(1)).doFilter(request, response);
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    @DisplayName("Bearer token không hợp lệ hoặc hết hạn -> Không set user vào SecurityContext")
    void doFilterInternal_withInvalidToken_shouldLeaveSecurityContextEmpty() throws ServletException, IOException {
        // 1. Arrange (Given)
        String invalidToken = "invalid.or.expired.token";
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + invalidToken);
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtTokenProvider.validateToken(invalidToken)).thenReturn(false);

        // 2. Act (When)
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // 3. Assert (Then)
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtTokenProvider, times(1)).validateToken(invalidToken);
        verify(jwtTokenProvider, never()).getUserIdFromToken(anyString());
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Bearer token hợp lệ -> Set đúng userId và ROLE_USER vào SecurityContext")
    void doFilterInternal_withValidBearerToken_shouldSetAuthenticationWithUserId() throws ServletException, IOException {
        // 1. Arrange (Given)
        String validToken = "valid.jwt.token";
        Long userId = 42L;
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + validToken);
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtTokenProvider.validateToken(validToken)).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(validToken)).thenReturn(userId);

        // 2. Act (When)
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // 3. Assert (Then)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo(userId);
        assertThat(auth.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
        verify(filterChain, times(1)).doFilter(request, response);
    }
}
