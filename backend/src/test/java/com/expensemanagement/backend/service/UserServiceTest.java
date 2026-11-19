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

    // =========================================================================
    // US1 [CNTT46-37]: BỔ SUNG UNIT TEST BIÊN & QUẢN LÝ USER
    // =========================================================================

    @Test
    @DisplayName("CNTT46-37: Đăng ký khi confirmPassword là null (Frontend đã kiểm tra) -> Vẫn đăng ký thành công")
    void register_withNullConfirmPassword_shouldSucceed() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("feuser")
                .fullName("Frontend User")
                .email("feuser@example.com")
                .password("Password123@")
                .confirmPassword(null)
                .build();

        User savedUser = User.builder()
                .userId(10L)
                .username("feuser")
                .fullName("Frontend User")
                .email("feuser@example.com")
                .passwordHash("$2a$10$encoded")
                .build();

        when(userRepository.existsByUsername("feuser")).thenReturn(false);
        when(userRepository.existsByEmail("feuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123@")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // 2. Act (When)
        UserResponse response = userService.register(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(10L);
        assertThat(response.getUsername()).isEqualTo("feuser");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("CNTT46-37: Đăng ký với username chứa chữ hoa và khoảng trắng -> Chuẩn hóa trim + lowercase trước khi kiểm tra trùng")
    void register_withUppercaseAndSpacesInUsername_shouldNormalizeBeforeCheckAndSave() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("   TranMinhVuong   ")
                .fullName("Trần Minh Vương")
                .email("vuong@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        User savedUser = User.builder()
                .userId(11L)
                .username("tranminhvuong")
                .fullName("Trần Minh Vương")
                .email("vuong@example.com")
                .passwordHash("$2a$10$encoded")
                .build();

        when(userRepository.existsByUsername("tranminhvuong")).thenReturn(false);
        when(userRepository.existsByEmail("vuong@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123@")).thenReturn("$2a$10$encoded");
        when(userRepository.save(userCaptor.capture())).thenReturn(savedUser);

        // 2. Act (When)
        UserResponse response = userService.register(request);

        // 3. Assert (Then)
        assertThat(userCaptor.getValue().getUsername()).isEqualTo("tranminhvuong");
        assertThat(response.getUsername()).isEqualTo("tranminhvuong");
        verify(userRepository, times(1)).existsByUsername("tranminhvuong");
    }

    @Test
    @DisplayName("CNTT46-37: Đăng ký với fullName có khoảng trắng thừa hai đầu -> Cắt khoảng trắng trước khi lưu")
    void register_withSpacesAroundFullName_shouldTrimFullName() {
        // 1. Arrange (Given)
        UserCreationRequest request = UserCreationRequest.builder()
                .username("minhvuong")
                .fullName("   Trần Minh Vương   ")
                .email("minhvuong@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        User savedUser = User.builder()
                .userId(12L)
                .username("minhvuong")
                .fullName("Trần Minh Vương")
                .email("minhvuong@example.com")
                .passwordHash("$2a$10$encoded")
                .build();

        when(userRepository.existsByUsername("minhvuong")).thenReturn(false);
        when(userRepository.existsByEmail("minhvuong@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123@")).thenReturn("$2a$10$encoded");
        when(userRepository.save(userCaptor.capture())).thenReturn(savedUser);

        // 2. Act (When)
        userService.register(request);

        // 3. Assert (Then)
        assertThat(userCaptor.getValue().getFullName()).isEqualTo("Trần Minh Vương");
    }

    @Test
    @DisplayName("CNTT46-37: Ánh xạ mapToUserResponse -> Phải map đầy đủ 6 trường bao gồm createdAt và updatedAt")
    void mapToUserResponse_shouldMapAllFieldsCorrectly() {
        // 1. Arrange (Given)
        LocalDateTime createdAt = LocalDateTime.of(2026, 11, 1, 10, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2026, 11, 2, 12, 30);
        User user = User.builder()
                .userId(50L)
                .username("mapuser")
                .fullName("Nguyễn Thị Ánh")
                .email("anh@example.com")
                .passwordHash("$2a$10$secretHash")
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();

        // 2. Act (When)
        UserResponse response = userService.mapToUserResponse(user);

        // 3. Assert (Then)
        assertThat(response.getUserId()).isEqualTo(50L);
        assertThat(response.getUsername()).isEqualTo("mapuser");
        assertThat(response.getFullName()).isEqualTo("Nguyễn Thị Ánh");
        assertThat(response.getEmail()).isEqualTo("anh@example.com");
        assertThat(response.getCreatedAt()).isEqualTo(createdAt);
        assertThat(response.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    @DisplayName("CNTT46-37: Xóa người dùng khi ID tồn tại -> Gọi repository.deleteById đúng 1 lần")
    void deleteUser_whenUserExists_shouldDeleteSuccessfully() {
        // 1. Arrange (Given)
        when(userRepository.existsById(5L)).thenReturn(true);

        // 2. Act (When)
        userService.deleteUser(5L);

        // 3. Assert (Then)
        verify(userRepository, times(1)).existsById(5L);
        verify(userRepository, times(1)).deleteById(5L);
    }

    @Test
    @DisplayName("CNTT46-37: Tìm người dùng theo email khi tồn tại -> Trả về đối tượng User")
    void findByEmail_whenUserExists_shouldReturnUser() {
        // 1. Arrange (Given)
        User user = User.builder().userId(7L).email("found@example.com").username("founduser").build();
        when(userRepository.findByEmail("found@example.com")).thenReturn(Optional.of(user));

        // 2. Act (When)
        User result = userService.findByEmail("found@example.com");

        // 3. Assert (Then)
        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(7L);
        assertThat(result.getEmail()).isEqualTo("found@example.com");
    }

    @Test
    @DisplayName("CNTT46-37: Tìm người dùng theo email khi không tồn tại -> Trả về null")
    void findByEmail_whenUserNotExists_shouldReturnNull() {
        // 1. Arrange (Given)
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        // 2. Act (When)
        User result = userService.findByEmail("missing@example.com");

        // 3. Assert (Then)
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("CNTT46-37: Tìm người dùng theo username khi tồn tại -> Trả về đối tượng User")
    void findByUsername_whenUserExists_shouldReturnUser() {
        // 1. Arrange (Given)
        User user = User.builder().userId(8L).username("vuongdev").email("vuongdev@example.com").build();
        when(userRepository.findByUsername("vuongdev")).thenReturn(Optional.of(user));

        // 2. Act (When)
        User result = userService.findByUsername("vuongdev");

        // 3. Assert (Then)
        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(8L);
        assertThat(result.getUsername()).isEqualTo("vuongdev");
    }

    @Test
    @DisplayName("CNTT46-37: Tìm người dùng theo username khi không tồn tại -> Trả về null")
    void findByUsername_whenUserNotExists_shouldReturnNull() {
        // 1. Arrange (Given)
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        // 2. Act (When)
        User result = userService.findByUsername("ghost");

        // 3. Assert (Then)
        assertThat(result).isNull();
    }
}
