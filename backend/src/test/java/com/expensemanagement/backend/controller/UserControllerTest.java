package com.expensemanagement.backend.controller;

import com.expensemanagement.backend.DTO.request.UserCreationRequest;
import com.expensemanagement.backend.DTO.response.UserResponse;
import com.expensemanagement.backend.exception.DuplicateResourceException;
import com.expensemanagement.backend.exception.ResourceNotFoundException;
import com.expensemanagement.backend.service.UserService;
import com.expensemanagement.backend.util.JwtTokenProvider;
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

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register hợp lệ -> Trả về HTTP 201 Created và không lộ mật khẩu")
    void register_withValidRequest_shouldReturn201Created() throws Exception {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("nguyenvana")
                .fullName("Nguyễn Văn A")
                .email("vana@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        UserResponse mockResponse = UserResponse.builder()
                .userId(1L)
                .username("nguyenvana")
                .fullName("Nguyễn Văn A")
                .email("vana@example.com")
                .build();

        when(userService.register(any(UserCreationRequest.class))).thenReturn(mockResponse);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Đăng ký thành công"))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.username").value("nguyenvana"))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn A"))
                .andExpect(jsonPath("$.data.email").value("vana@example.com"))
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register trùng email -> Trả về HTTP 409 Conflict")
    void register_withDuplicateEmail_shouldReturn409Conflict() throws Exception {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("newuser")
                .fullName("Nguyễn Văn B")
                .email("existing@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        when(userService.register(any(UserCreationRequest.class)))
                .thenThrow(new DuplicateResourceException("Email đã được sử dụng"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("Email đã được sử dụng"))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register trùng username -> Trả về HTTP 409 Conflict")
    void register_withDuplicateUsername_shouldReturn409Conflict() throws Exception {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("existinguser")
                .fullName("Nguyễn Văn C")
                .email("new@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        when(userService.register(any(UserCreationRequest.class)))
                .thenThrow(new DuplicateResourceException("Tên đăng nhập đã được sử dụng"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("Tên đăng nhập đã được sử dụng"));
    }

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register mật khẩu xác nhận không khớp -> Trả về HTTP 400 Bad Request")
    void register_withMismatchedConfirmPassword_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("validuser")
                .fullName("Trần Minh Vương")
                .email("valid@example.com")
                .password("Password123@")
                .confirmPassword("WrongConfirm123@")
                .build();

        when(userService.register(any(UserCreationRequest.class)))
                .thenThrow(new IllegalArgumentException("Mật khẩu xác nhận không khớp"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Mật khẩu xác nhận không khớp"));
    }

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register email sai định dạng -> Trả về HTTP 400 Bad Request")
    void register_withInvalidEmail_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("validuser")
                .fullName("Trần Minh Vương")
                .email("sai-dinh-dang")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message", containsString("Email không đúng định dạng")));
    }

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register mật khẩu ngắn dưới 8 ký tự -> Trả về HTTP 400 Bad Request")
    void register_withShortPassword_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("validuser")
                .fullName("Trần Minh Vương")
                .email("valid@example.com")
                .password("1234567")
                .confirmPassword("1234567")
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message", containsString("Mật khẩu phải từ 8 đến 72 ký tự")));
    }

    @Test
    @DisplayName("CNTT46-37: POST /api/v1/users/register với body JSON rỗng {} -> Trả về HTTP 400 Bad Request")
    void register_withEmptyJsonBody_shouldReturn400BadRequest() throws Exception {
        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("CNTT46-37: GET /api/v1/users kèm JWT hợp lệ -> Trả về HTTP 200 OK và danh sách người dùng")
    void getAllUsers_withValidToken_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        List<UserResponse> users = List.of(
                UserResponse.builder().userId(1L).username("user1").fullName("User One").email("u1@example.com").build(),
                UserResponse.builder().userId(2L).username("user2").fullName("User Two").email("u2@example.com").build()
        );
        when(userService.getAllUsers()).thenReturn(users);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].username").value("user1"))
                .andExpect(jsonPath("$.data[1].username").value("user2"));
    }

    @Test
    @DisplayName("CNTT46-37: GET /api/v1/users không có JWT token -> Bị chặn với HTTP 403 Forbidden")
    void getAllUsers_withoutToken_shouldReturn403Forbidden() throws Exception {
        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CNTT46-37: GET /api/v1/users/{id} kèm JWT hợp lệ -> Trả về HTTP 200 OK và thông tin User")
    void getUserById_whenUserExists_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        UserResponse mockUser = UserResponse.builder()
                .userId(1L)
                .username("vuong")
                .fullName("Trần Minh Vương")
                .email("vuong@example.com")
                .build();
        when(userService.getUserById(1L)).thenReturn(mockUser);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/users/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.userId").value(1))
                .andExpect(jsonPath("$.data.username").value("vuong"));
    }

    @Test
    @DisplayName("CNTT46-37: GET /api/v1/users/{id} khi user không tồn tại -> Trả về HTTP 404 Not Found")
    void getUserById_whenUserNotFound_shouldReturn404NotFound() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        when(userService.getUserById(99L))
                .thenThrow(new ResourceNotFoundException("Không tìm thấy người dùng với ID: 99"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/users/99")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy người dùng với ID: 99"));
    }

    @Test
    @DisplayName("CNTT46-37: DELETE /api/v1/users/{id} kèm JWT hợp lệ -> Trả về HTTP 200 OK và gọi deleteUser")
    void deleteUser_withValidToken_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        doNothing().when(userService).deleteUser(5L);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(delete("/api/v1/users/5")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(userService).deleteUser(5L);
    }
}
