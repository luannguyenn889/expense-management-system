package com.expensemanagement.backend.controller;

import com.expensemanagement.backend.DTO.request.GoogleLoginRequest;
import com.expensemanagement.backend.DTO.request.LoginRequest;
import com.expensemanagement.backend.DTO.response.LoginResponse;
import com.expensemanagement.backend.DTO.response.UserResponse;
import com.expensemanagement.backend.exception.UnauthorizedException;
import com.expensemanagement.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/v1/auth/login hợp lệ -> Trả về HTTP 200 OK và accessToken")
    void login_withValidRequest_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("Password123@")
                .build();

        LoginResponse mockResponse = LoginResponse.builder()
                .accessToken("jwt.access.token")
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(UserResponse.builder()
                        .userId(1L)
                        .username("nguyenvana")
                        .email("user@example.com")
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("jwt.access.token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("user@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login thiếu mật khẩu -> Trả về HTTP 400 Bad Request")
    void login_withBlankPassword_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("")
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Mật khẩu không được để trống"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login sai thông tin đăng nhập -> Trả về HTTP 401 Unauthorized")
    void login_whenUnauthorized_shouldReturn401Unauthorized() throws Exception {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("WrongPassword!")
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new UnauthorizedException("Email hoặc mật khẩu không chính xác"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google hợp lệ -> Trả về HTTP 200 OK và accessToken")
    void loginWithGoogle_withValidRequest_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .idToken("valid.google.idtoken")
                .build();

        LoginResponse mockResponse = LoginResponse.builder()
                .accessToken("jwt.google.token")
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(UserResponse.builder()
                        .userId(10L)
                        .username("googleuser")
                        .email("googleuser@gmail.com")
                        .build())
                .build();

        when(authService.loginWithGoogle(any(GoogleLoginRequest.class))).thenReturn(mockResponse);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("jwt.google.token"))
                .andExpect(jsonPath("$.data.user.email").value("googleuser@gmail.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google với idToken rỗng -> Trả về HTTP 400 Bad Request")
    void loginWithGoogle_withBlankIdToken_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .idToken("   ")
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("ID Token của Google không được để trống"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login bằng username hợp lệ -> Trả về HTTP 200 OK")
    void login_withUsernameRequest_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .username("nguyenvana")
                .password("Password123@")
                .build();

        LoginResponse mockResponse = LoginResponse.builder()
                .accessToken("jwt.username.token")
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(UserResponse.builder()
                        .userId(2L)
                        .username("nguyenvana")
                        .email("user@example.com")
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").value("jwt.username.token"))
                .andExpect(jsonPath("$.data.user.username").value("nguyenvana"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login với body JSON rỗng -> Trả về HTTP 400 Bad Request")
    void login_withEmptyJsonBody_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange, 2. Act & 3. Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Mật khẩu không được để trống"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google khi Google ID Token không hợp lệ -> Trả về HTTP 401 Unauthorized")
    void loginWithGoogle_whenUnauthorized_shouldReturn401Unauthorized() throws Exception {
        // 1. Arrange (Given)
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .idToken("expired.google.idtoken")
                .build();

        when(authService.loginWithGoogle(any(GoogleLoginRequest.class)))
                .thenThrow(new UnauthorizedException("Google ID Token không hợp lệ hoặc đã hết hạn"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("Google ID Token không hợp lệ hoặc đã hết hạn"));
    }

    @Test
    @DisplayName("Endpoint /api/v1/auth/login và /google là public -> Truy cập không cần header Authorization")
    void authEndpoints_withoutToken_shouldBePubliclyAccessible() throws Exception {
        // 1. Arrange (Given)
        LoginRequest loginReq = LoginRequest.builder()
                .email("public@example.com")
                .password("Password123@")
                .build();
        when(authService.login(any(LoginRequest.class)))
                .thenReturn(LoginResponse.builder().accessToken("ok").tokenType("Bearer").expiresIn(86400L).build());

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk());
    }
}
