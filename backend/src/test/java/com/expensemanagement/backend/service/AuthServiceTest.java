package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.GoogleLoginRequest;
import com.expensemanagement.backend.DTO.request.LoginRequest;
import com.expensemanagement.backend.DTO.response.LoginResponse;
import com.expensemanagement.backend.entity.User;
import com.expensemanagement.backend.exception.UnauthorizedException;
import com.expensemanagement.backend.repository.UserRepository;
import com.expensemanagement.backend.util.GoogleAuthVerifier;
import com.expensemanagement.backend.util.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private GoogleAuthVerifier googleAuthVerifier;

    private JwtTokenProvider jwtTokenProvider;
    private AuthService authService;

    private final String secretKey = "testSecretKeyForJwtSigningMustBeAtLeast32BytesLong!";
    private final long expirationTime = 86400000L;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secretKey, expirationTime);
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenProvider, googleAuthVerifier, expirationTime);
    }

    @Test
    @DisplayName("Đăng nhập thành công với thông tin hợp lệ -> Trả về Access Token và thông tin User")
    void login_withValidCredentials_shouldReturnToken() {
        // 1. Arrange (Given)
        String email = "user@example.com";
        String rawPassword = "Password123@";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(1L)
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email(email)
                .passwordHash(encodedHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(rawPassword)
                .build();

        when(userRepository.findByEmailOrUsername(email, email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, encodedHash)).thenReturn(true);

        // 2. Act (When)
        LoginResponse response = authService.login(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getUserId()).isEqualTo(1L);
        assertThat(response.getUser().getUsername()).isEqualTo("nguyenvana");
        assertThat(response.getUser().getEmail()).isEqualTo(email);

        verify(userRepository, times(1)).findByEmailOrUsername(email, email);
        verify(passwordEncoder, times(1)).matches(rawPassword, encodedHash);
    }

    @Test
    @DisplayName("Đăng nhập bằng Username thành công -> Trả về Access Token")
    void login_withValidUsername_shouldReturnToken() {
        // 1. Arrange (Given)
        String username = "nguyenvana";
        String rawPassword = "Password123@";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(1L)
                .username(username)
                .fullName("Nguyen Van A")
                .email("user@example.com")
                .passwordHash(encodedHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .username(username)
                .password(rawPassword)
                .build();

        when(userRepository.findByEmailOrUsername(username, username)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, encodedHash)).thenReturn(true);

        // 2. Act (When)
        LoginResponse response = authService.login(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getUser().getUsername()).isEqualTo(username);

        verify(userRepository, times(1)).findByEmailOrUsername(username, username);
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu -> Ném UnauthorizedException")
    void login_withWrongPassword_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        String email = "user@example.com";
        String wrongPassword = "WrongPassword!";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(1L)
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email(email)
                .passwordHash(encodedHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(wrongPassword)
                .build();

        when(userRepository.findByEmailOrUsername(email, email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(wrongPassword, encodedHash)).thenReturn(false);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");

        verify(userRepository, times(1)).findByEmailOrUsername(email, email);
        verify(passwordEncoder, times(1)).matches(wrongPassword, encodedHash);
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi email không tồn tại -> Ném UnauthorizedException không lộ email")
    void login_withNonExistingEmail_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        String nonExistingEmail = "notfound@example.com";
        LoginRequest request = LoginRequest.builder()
                .email(nonExistingEmail)
                .password("Password123@")
                .build();

        when(userRepository.findByEmailOrUsername(nonExistingEmail, nonExistingEmail)).thenReturn(Optional.empty());

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");

        verify(userRepository, times(1)).findByEmailOrUsername(nonExistingEmail, nonExistingEmail);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Xác thực Token sinh ra -> Giải mã lấy đúng userId ban đầu")
    void generateToken_thenGetUserIdFromToken_shouldReturnSameUserId() {
        // 1. Arrange (Given)
        Long originalUserId = 99L;

        // 2. Act (When)
        String token = jwtTokenProvider.generateToken(originalUserId);
        Long extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

        // 3. Assert (Then)
        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(extractedUserId).isEqualTo(originalUserId);
    }

    @Test
    @DisplayName("Đăng nhập Google thành công với User đã tồn tại -> Trả về Token và thông tin User")
    void loginWithGoogle_withValidIdToken_whenUserExists_shouldReturnToken() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.google.idtoken";
        String googleEmail = "googleuser@gmail.com";
        String googleName = "Google User";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(googleEmail);
        payload.set("name", googleName);
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        User existingUser = User.builder()
                .userId(10L)
                .username("googleuser")
                .fullName(googleName)
                .email(googleEmail)
                .passwordHash("hashed")
                .build();
        when(userRepository.findByEmail(googleEmail)).thenReturn(Optional.of(existingUser));

        // 2. Act (When)
        GoogleLoginRequest request = GoogleLoginRequest.builder().idToken(rawGoogleToken).build();
        LoginResponse response = authService.loginWithGoogle(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getUser().getEmail()).isEqualTo(googleEmail);
        assertThat(response.getUser().getUsername()).isEqualTo("googleuser");
        assertThat(response.getUser().getUserId()).isEqualTo(10L);

        verify(googleAuthVerifier, times(1)).verify(rawGoogleToken);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu (chưa có tài khoản) -> Tự động đăng ký và trả về Token")
    void loginWithGoogle_withValidIdToken_whenUserNotExists_shouldAutoRegisterAndReturnToken() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.google.idtoken.new";
        String googleEmail = "newuser@gmail.com";
        String googleName = "New User";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(googleEmail);
        payload.set("name", googleName);
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(googleEmail)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$randomHash");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        User savedUser = User.builder()
                .userId(20L)
                .username("newuser")
                .fullName(googleName)
                .email(googleEmail)
                .passwordHash("$2a$10$randomHash")
                .build();
        when(userRepository.save(userCaptor.capture())).thenReturn(savedUser);

        // 2. Act (When)
        GoogleLoginRequest request = GoogleLoginRequest.builder().idToken(rawGoogleToken).build();
        LoginResponse response = authService.loginWithGoogle(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getUser().getUserId()).isEqualTo(20L);
        assertThat(response.getUser().getEmail()).isEqualTo(googleEmail);

        User captured = userCaptor.getValue();
        assertThat(captured.getEmail()).isEqualTo(googleEmail);
        assertThat(captured.getFullName()).isEqualTo(googleName);
        assertThat(captured.getUsername()).isNotBlank();
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng nhập Google thất bại khi ID Token không hợp lệ -> Ném UnauthorizedException")
    void loginWithGoogle_withInvalidIdToken_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        String invalidToken = "invalid.token";
        when(googleAuthVerifier.verify(invalidToken)).thenReturn(null);

        GoogleLoginRequest request = GoogleLoginRequest.builder().idToken(invalidToken).build();

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.loginWithGoogle(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Google ID Token không hợp lệ hoặc đã hết hạn");

        verify(googleAuthVerifier, times(1)).verify(invalidToken);
        verify(userRepository, never()).findByEmail(anyString());
    }
}
