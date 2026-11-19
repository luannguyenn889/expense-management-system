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
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

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
    private Validator validator;

    private final String secretKey = "testSecretKeyForJwtSigningMustBeAtLeast32BytesLong!";
    private final long expirationTime = 86400000L;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secretKey, expirationTime);
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenProvider, googleAuthVerifier, expirationTime);
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
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

    // =========================================================================
    // NHÓM 1: BỔ SUNG UNIT TEST ĐĂNG NHẬP BẰNG MẬT KHẨU (login)
    // =========================================================================

    @Test
    @DisplayName("Đăng nhập bằng trường usernameOrEmail -> Lấy đúng identifier và trả về Token")
    void login_withUsernameOrEmailField_shouldReturnToken() {
        // 1. Arrange (Given)
        String identifier = "nguyenvana@example.com";
        String rawPassword = "Password123@";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(1L)
                .username("nguyenvana")
                .fullName("Nguyen Van A")
                .email(identifier)
                .passwordHash(encodedHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail(identifier)
                .password(rawPassword)
                .build();

        when(userRepository.findByEmailOrUsername(identifier, identifier)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, encodedHash)).thenReturn(true);

        // 2. Act (When)
        LoginResponse response = authService.login(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getUser().getEmail()).isEqualTo(identifier);
        verify(userRepository, times(1)).findByEmailOrUsername(identifier, identifier);
    }

    @Test
    @DisplayName("Đăng nhập với identifier chứa khoảng trắng và chữ hoa -> Tự động trim và lowercase")
    void login_withIdentifierSpacesAndUppercase_shouldTrimAndLowercase() {
        // 1. Arrange (Given)
        String rawInput = "  USER@Example.COM  ";
        String normalized = "user@example.com";
        String rawPassword = "Password123@";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(2L)
                .username("user")
                .fullName("User Example")
                .email(normalized)
                .passwordHash(encodedHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .email(rawInput)
                .password(rawPassword)
                .build();

        when(userRepository.findByEmailOrUsername(normalized, normalized)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, encodedHash)).thenReturn(true);

        // 2. Act (When)
        LoginResponse response = authService.login(request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo(normalized);
        verify(userRepository, times(1)).findByEmailOrUsername(normalized, normalized);
    }

    @Test
    @DisplayName("Đăng nhập khi identifier null hoặc toàn khoảng trắng -> Ném UnauthorizedException và không gọi DB")
    void login_withNullOrBlankIdentifier_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .username("   ")
                .email(null)
                .usernameOrEmail("")
                .password("Password123@")
                .build();

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");

        verifyNoInteractions(userRepository);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Đăng nhập thành công -> Trả về expiresIn tính theo giây và tokenType là Bearer")
    void login_shouldReturnCorrectExpiresInSecondsAndBearerType() {
        // 1. Arrange (Given)
        String email = "time@example.com";
        String rawPassword = "Password123@";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(3L)
                .username("timeuser")
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
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(expirationTime / 1000);
    }

    @Test
    @DisplayName("Đăng nhập thành công -> Map đầy đủ các trường thông tin UserResponse")
    void login_shouldMapUserResponseFieldsCorrectly() {
        // 1. Arrange (Given)
        LocalDateTime created = LocalDateTime.of(2026, 1, 1, 10, 0);
        LocalDateTime updated = LocalDateTime.of(2026, 1, 2, 12, 30);
        String email = "full@example.com";
        String rawPassword = "Password123@";
        String encodedHash = "$2a$10$hashed";

        User mockUser = User.builder()
                .userId(5L)
                .username("fulluser")
                .fullName("Full Name")
                .email(email)
                .passwordHash(encodedHash)
                .createdAt(created)
                .updatedAt(updated)
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
        assertThat(response.getUser().getUserId()).isEqualTo(5L);
        assertThat(response.getUser().getUsername()).isEqualTo("fulluser");
        assertThat(response.getUser().getFullName()).isEqualTo("Full Name");
        assertThat(response.getUser().getEmail()).isEqualTo(email);
        assertThat(response.getUser().getCreatedAt()).isEqualTo(created);
        assertThat(response.getUser().getUpdatedAt()).isEqualTo(updated);
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu với tài khoản Google -> Ném UnauthorizedException")
    void login_whenAccountCreatedByGoogleWithWrongManualPassword_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        String email = "googleonly@gmail.com";
        String wrongPassword = "AnyPassword123";
        String randomGoogleHash = "$2a$10$randomUuidHash";

        User googleUser = User.builder()
                .userId(6L)
                .username("googleonly")
                .email(email)
                .passwordHash(randomGoogleHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(wrongPassword)
                .build();

        when(userRepository.findByEmailOrUsername(email, email)).thenReturn(Optional.of(googleUser));
        when(passwordEncoder.matches(wrongPassword, randomGoogleHash)).thenReturn(false);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");
    }

    // =========================================================================
    // NHÓM 2: BỔ SUNG UNIT TEST ĐĂNG NHẬP BẰNG GOOGLE (loginWithGoogle)
    // =========================================================================

    @Test
    @DisplayName("Đăng nhập Google thất bại khi payload không có email -> Ném UnauthorizedException")
    void loginWithGoogle_whenPayloadEmailIsNullOrBlank_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.noemail";
        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("   ");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        GoogleLoginRequest request = GoogleLoginRequest.builder().idToken(rawGoogleToken).build();

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.loginWithGoogle(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Không thể lấy thông tin email từ Google");

        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("Đăng nhập Google với email viết hoa và khoảng trắng -> Chuẩn hóa trước khi tìm user")
    void loginWithGoogle_whenEmailHasUppercaseAndSpaces_shouldNormalizeBeforeLookup() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.upper";
        String normalizedEmail = "user.google@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("  User.Google@Gmail.COM ");
        payload.set("name", "Google User");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        User existingUser = User.builder()
                .userId(11L)
                .username("usergoogle")
                .fullName("Google User")
                .email(normalizedEmail)
                .passwordHash("hashed")
                .build();
        when(userRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(existingUser));

        // 2. Act (When)
        LoginResponse response = authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        assertThat(response.getUser().getEmail()).isEqualTo(normalizedEmail);
        verify(userRepository, times(1)).findByEmail(normalizedEmail);
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu khi payload thiếu name -> Lấy phần trước @ làm fullName")
    void loginWithGoogle_whenPayloadNameIsNullOrBlank_shouldFallbackNameFromEmail() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.noname";
        String email = "nonameuser@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(email);
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("nonameuser")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(30L);
            return u;
        });

        // 2. Act (When)
        LoginResponse response = authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        assertThat(userCaptor.getValue().getFullName()).isEqualTo("nonameuser");
        assertThat(response.getUser().getFullName()).isEqualTo("nonameuser");
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu với prefix email < 3 ký tự -> Tự thêm tiền tố user_")
    void loginWithGoogle_whenEmailPrefixShorterThan3Chars_shouldAddUserPrefix() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.short";
        String email = "ab@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(email);
        payload.set("name", "Short Name");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("user_ab")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(31L);
            return u;
        });

        // 2. Act (When)
        authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        assertThat(userCaptor.getValue().getUsername()).isEqualTo("user_ab");
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu với email chứa ký tự đặc biệt -> Loại bỏ ký tự đặc biệt khỏi username")
    void loginWithGoogle_whenEmailPrefixHasSpecialChars_shouldStripSpecialChars() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.special";
        String email = "nguyen.van-a+1@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(email);
        payload.set("name", "Nguyen Van A");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("nguyenvana1")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(32L);
            return u;
        });

        // 2. Act (When)
        authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        assertThat(userCaptor.getValue().getUsername()).isEqualTo("nguyenvana1");
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu khi username sinh ra đã tồn tại -> Gắn hậu tố ngẫu nhiên")
    void loginWithGoogle_whenGeneratedUsernameExists_shouldAppendRandomSuffix() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.dupuser";
        String email = "existingname@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(email);
        payload.set("name", "Existing Name");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("existingname")).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(33L);
            return u;
        });

        // 2. Act (When)
        authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        String savedUsername = userCaptor.getValue().getUsername();
        assertThat(savedUsername).startsWith("existingname_");
        assertThat(savedUsername.length()).isEqualTo("existingname_".length() + 5);
    }

    // =========================================================================
    // NHÓM 3: DTO VALIDATION & HELPER (LoginRequest & GoogleLoginRequest)
    // =========================================================================

    @Test
    @DisplayName("LoginRequest.getIdentifier() ưu tiên lấy usernameOrEmail khi truyền cả 3 trường")
    void loginRequest_getIdentifier_shouldPrioritizeUsernameOrEmailOverOthers() {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("  priorityUser  ")
                .username("secondaryUser")
                .email("third@example.com")
                .password("Password123@")
                .build();

        // 2. Act (When)
        String identifier = request.getIdentifier();

        // 3. Assert (Then)
        assertThat(identifier).isEqualTo("priorityUser");
    }

    @Test
    @DisplayName("LoginRequest với mật khẩu trống -> Bean Validation báo lỗi đúng thông điệp")
    void loginRequest_withBlankPassword_shouldFailBeanValidation() {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("   ")
                .build();

        // 2. Act (When)
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations).isNotEmpty();
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Mật khẩu không được để trống");
    }

    @Test
    @DisplayName("GoogleLoginRequest với idToken trống -> Bean Validation báo lỗi đúng thông điệp")
    void googleLoginRequest_withBlankIdToken_shouldFailBeanValidation() {
        // 1. Arrange (Given)
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .idToken("")
                .build();

        // 2. Act (When)
        Set<ConstraintViolation<GoogleLoginRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations).isNotEmpty();
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("ID Token của Google không được để trống");
    }

    @Test
    @DisplayName("LoginRequest.getIdentifier() khi usernameOrEmail null -> Ưu tiên username trước email")
    void loginRequest_getIdentifier_whenUsernameOrEmailNull_shouldPrioritizeUsernameOverEmail() {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail(null)
                .username("  myusername  ")
                .email("myemail@example.com")
                .password("Password123@")
                .build();

        // 2. Act (When)
        String identifier = request.getIdentifier();

        // 3. Assert (Then)
        assertThat(identifier).isEqualTo("myusername");
    }

    @Test
    @DisplayName("LoginRequest.getIdentifier() khi cả 3 trường đều rỗng/khoảng trắng -> Trả về null")
    void loginRequest_getIdentifier_whenAllFieldsBlank_shouldReturnNull() {
        // 1. Arrange (Given)
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("   ")
                .username("")
                .email("  ")
                .password("Password123@")
                .build();

        // 2. Act (When)
        String identifier = request.getIdentifier();

        // 3. Assert (Then)
        assertThat(identifier).isNull();
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu khi prefix email toàn ký tự đặc biệt -> Fallback thành user_")
    void loginWithGoogle_whenEmailPrefixOnlySpecialChars_shouldFallbackToUserPrefix() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.token.dots";
        String email = "...@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(email);
        payload.set("name", "Special User");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("user_")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hash");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(34L);
            return u;
        });

        // 2. Act (When)
        authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        assertThat(userCaptor.getValue().getUsername()).isEqualTo("user_");
    }

    @Test
    @DisplayName("Đăng nhập với mật khẩu toàn khoảng trắng -> passwordEncoder không khớp -> Ném UnauthorizedException")
    void login_withWhitespaceOnlyPassword_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        String email = "user@example.com";
        String whitespacePassword = "    ";
        String encodedHash = "$2a$10$hashedPasswordValue";

        User mockUser = User.builder()
                .userId(1L)
                .username("nguyenvana")
                .email(email)
                .passwordHash(encodedHash)
                .build();

        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(whitespacePassword)
                .build();

        when(userRepository.findByEmailOrUsername(email, email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(whitespacePassword, encodedHash)).thenReturn(false);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Email hoặc mật khẩu không chính xác");

        verify(passwordEncoder, times(1)).matches(whitespacePassword, encodedHash);
    }

    @Test
    @DisplayName("Đăng nhập Google với user đã tồn tại -> Không gọi save() và không gọi passwordEncoder.encode()")
    void loginWithGoogle_whenExistingUser_shouldNotCallSaveOrEncodePassword() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.google.existing";
        String googleEmail = "existing.google@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(googleEmail);
        payload.set("name", "Existing Google");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        User existingUser = User.builder()
                .userId(50L)
                .username("existinggoogle")
                .fullName("Existing Google")
                .email(googleEmail)
                .passwordHash("$2a$10$existing")
                .build();
        when(userRepository.findByEmail(googleEmail)).thenReturn(Optional.of(existingUser));

        // 2. Act (When)
        authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    @DisplayName("Đăng nhập Google lần đầu (JIT) -> Phải băm mật khẩu ngẫu nhiên khác rỗng qua passwordEncoder trước khi lưu")
    void loginWithGoogle_whenNewUserCreated_shouldEncodeNonEmptyRandomPassword() {
        // 1. Arrange (Given)
        String rawGoogleToken = "valid.google.jit";
        String googleEmail = "jit.user@gmail.com";

        GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(googleEmail);
        payload.set("name", "JIT User");
        when(mockIdToken.getPayload()).thenReturn(payload);
        when(googleAuthVerifier.verify(rawGoogleToken)).thenReturn(mockIdToken);

        when(userRepository.findByEmail(googleEmail)).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("jituser")).thenReturn(false);

        ArgumentCaptor<String> rawPasswordCaptor = ArgumentCaptor.forClass(String.class);
        when(passwordEncoder.encode(rawPasswordCaptor.capture())).thenReturn("$2a$10$encodedRandom");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(51L);
            return u;
        });

        // 2. Act (When)
        authService.loginWithGoogle(GoogleLoginRequest.builder().idToken(rawGoogleToken).build());

        // 3. Assert (Then)
        assertThat(rawPasswordCaptor.getValue()).isNotBlank();
        verify(passwordEncoder, times(1)).encode(anyString());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
