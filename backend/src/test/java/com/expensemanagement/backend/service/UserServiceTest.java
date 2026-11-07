package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.UserCreationRequest;
import com.expensemanagement.backend.DTO.response.UserResponse;
import com.expensemanagement.backend.entity.User;
import com.expensemanagement.backend.exception.DuplicateResourceException;
import com.expensemanagement.backend.exception.ResourceNotFoundException;
import com.expensemanagement.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Đăng ký tài khoản thành công khi dữ liệu hợp lệ -> Trả về UserResponse")
    void register_withValidData_shouldReturnUserResponse() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email("nguyenvana@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        LocalDateTime now = LocalDateTime.now();
        User savedUser = User.builder()
                .userId(1L)
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email("nguyenvana@example.com")
                .passwordHash("$2a$10$hashedPasswordValue")
                .createdAt(now)
                .updatedAt(now)
                .build();

        when(userRepository.existsByUsername("nguyenvana")).thenReturn(false);
        when(userRepository.existsByEmail("nguyenvana@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123@")).thenReturn("$2a$10$hashedPasswordValue");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // 2. Act (When)
        UserResponse response = userService.register(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("nguyenvana");
        assertThat(response.getFullName()).isEqualTo("Nguyen Van A");
        assertThat(response.getEmail()).isEqualTo("nguyenvana@example.com");
        assertThat(response.getCreatedAt()).isEqualTo(now);

        verify(userRepository, times(1)).existsByUsername("nguyenvana");
        verify(userRepository, times(1)).existsByEmail("nguyenvana@example.com");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi Mật khẩu xác nhận không khớp -> Ném IllegalArgumentException (400)")
    void register_withMismatchedConfirmPassword_shouldThrowIllegalArgumentException() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email("nguyenvana@example.com")
                .password("Password123@")
                .confirmPassword("PasswordKhac123@")
                .build();

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Mật khẩu xác nhận không khớp");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi Email đã tồn tại -> Ném DuplicateResourceException (409)")
    void register_withExistingEmail_shouldThrowDuplicateResourceException() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("nguyenvanb")
                .fullName("Nguyen Van B")
                .email("existing@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        when(userRepository.existsByUsername("nguyenvanb")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email đã được sử dụng");

        verify(userRepository, times(1)).existsByUsername("nguyenvanb");
        verify(userRepository, times(1)).existsByEmail("existing@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi Username đã tồn tại -> Ném DuplicateResourceException (409)")
    void register_withExistingUsername_shouldThrowDuplicateResourceException() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("existinguser")
                .fullName("Nguyen Van C")
                .email("newemail@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Tên đăng nhập đã được sử dụng");

        verify(userRepository, times(1)).existsByUsername("existinguser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thành công -> Mật khẩu phải được băm bằng BCrypt trước khi lưu DB")
    void register_withValidData_shouldHashPasswordBeforeSave() {
        // 1. Arrange (Given)
        String rawPassword = "MySecretPassword123";
        String hashedPassword = "$2a$10$eImiTXuWVxfM37uY4JANjQ==";

        UserCreationRequest request = UserCreationRequest.builder()
                .username("userhash")
                .fullName("User Hash Test")
                .email("userhash@example.com")
                .password(rawPassword)
                .confirmPassword(rawPassword)
                .build();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        User savedUser = User.builder()
                .userId(2L)
                .username("userhash")
                .fullName("User Hash Test")
                .email("userhash@example.com")
                .passwordHash(hashedPassword)
                .build();

        when(userRepository.existsByUsername("userhash")).thenReturn(false);
        when(userRepository.existsByEmail("userhash@example.com")).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);
        when(userRepository.save(userCaptor.capture())).thenReturn(savedUser);

        // 2. Act (When)
        userService.register(request);

        // 3. Assert (Then)
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getPasswordHash()).isEqualTo(hashedPassword);
        assertThat(capturedUser.getPasswordHash()).isNotEqualTo(rawPassword);
        verify(passwordEncoder, times(1)).encode(rawPassword);
    }

    @Test
    @DisplayName("Đăng ký với Email viết hoa và có khoảng trắng -> Tự động chuẩn hóa về chữ thường trước khi lưu")
    void register_withUppercaseEmail_shouldNormalizeToLowercase() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("  UserUpper  ")
                .fullName("  Nguyen Van Upper  ")
                .email("  USER.UPPER@Example.COM  ")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        User savedUser = User.builder()
                .userId(3L)
                .username("userupper")
                .fullName("Nguyen Van Upper")
                .email("user.upper@example.com")
                .passwordHash("$2a$10$hashed")
                .build();

        when(userRepository.existsByUsername("userupper")).thenReturn(false);
        when(userRepository.existsByEmail("user.upper@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123@")).thenReturn("$2a$10$hashed");
        when(userRepository.save(userCaptor.capture())).thenReturn(savedUser);

        // 2. Act (When)
        UserResponse response = userService.register(request);

        // 3. Assert (Then)
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getEmail()).isEqualTo("user.upper@example.com");
        assertThat(capturedUser.getUsername()).isEqualTo("userupper");
        assertThat(capturedUser.getFullName()).isEqualTo("Nguyen Van Upper");
        assertThat(response.getEmail()).isEqualTo("user.upper@example.com");

        verify(userRepository, times(1)).existsByEmail("user.upper@example.com");
    }

    @Test
    @DisplayName("Lấy thông tin người dùng theo ID hợp lệ -> Trả về UserResponse")
    void getUserById_whenUserExists_shouldReturnUserResponse() {
        // 1. Arrange (Given)
        User user = User.builder()
                .userId(1L)
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email("nguyenvana@example.com")
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // 2. Act (When)
        UserResponse response = userService.getUserById(1L);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("nguyenvana");
    }

    @Test
    @DisplayName("Lấy thông tin người dùng khi ID không tồn tại -> Ném ResourceNotFoundException")
    void getUserById_whenUserNotExists_shouldThrowResourceNotFoundException() {
        // 1. Arrange (Given)
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Lấy danh sách tất cả người dùng -> Trả về danh sách UserResponse")
    void getAllUsers_shouldReturnListOfUserResponses() {
        // 1. Arrange (Given)
        User user1 = User.builder().userId(1L).username("user1").fullName("User 1").email("u1@test.com").build();
        User user2 = User.builder().userId(2L).username("user2").fullName("User 2").email("u2@test.com").build();
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        // 2. Act (When)
        List<UserResponse> result = userService.getAllUsers();

        // 3. Assert (Then)
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getUsername()).isEqualTo("user1");
        assertThat(result.get(1).getUsername()).isEqualTo("user2");
    }

    @Test
    @DisplayName("Xóa người dùng khi ID không tồn tại -> Ném ResourceNotFoundException")
    void deleteUser_whenUserNotExists_shouldThrowResourceNotFoundException() {
        // 1. Arrange (Given)
        when(userRepository.existsById(99L)).thenReturn(false);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(userRepository, never()).deleteById(anyLong());
    }
}
