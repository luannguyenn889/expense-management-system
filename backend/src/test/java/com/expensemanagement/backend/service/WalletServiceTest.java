package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.entity.Wallet;
import com.expensemanagement.backend.repository.WalletRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private WalletService walletService;

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Tạo ví thành công khi thông tin hợp lệ -> Trả về thông tin ví đã tạo")
    void createWallet_withValidData_shouldReturnCreatedWallet() {
        // 1. Arrange (Given)
        Long userId = 1L;
        BigDecimal initialBalance = new BigDecimal("1000000.00");
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Tiết Kiệm")
                .balance(initialBalance)
                .build();

        Wallet savedWallet = Wallet.builder()
                .walletId(10L)
                .userId(userId)
                .walletName("Ví Tiết Kiệm")
                .balance(initialBalance)
                .isActive(true)
                .build();

        when(walletRepository.save(any(Wallet.class))).thenReturn(savedWallet);

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getWalletId()).isEqualTo(10L);
        assertThat(response.getWalletName()).isEqualTo("Ví Tiết Kiệm");
        assertThat(response.getBalance()).isEqualByComparingTo("1000000.00");
        assertThat(response.getIsActive()).isTrue();

        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Tạo ví không truyền số dư ban đầu -> Mặc định số dư là 0.00")
    void createWallet_withoutInitialBalance_shouldDefaultToZero() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Mặc Định")
                .balance(null)
                .build();

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        Wallet savedWallet = Wallet.builder()
                .walletId(20L)
                .userId(userId)
                .walletName("Ví Mặc Định")
                .balance(BigDecimal.ZERO)
                .isActive(true)
                .build();

        when(walletRepository.save(walletCaptor.capture())).thenReturn(savedWallet);

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);

        Wallet captured = walletCaptor.getValue();
        assertThat(captured.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Tạo ví thành công -> Luôn gán đúng userId từ JWT của phiên đăng nhập hiện tại")
    void createWallet_withValidData_shouldAssignCurrentUserId() {
        // 1. Arrange (Given)
        Long currentUserId = 42L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Cá Nhân")
                .balance(new BigDecimal("50000.00"))
                .build();

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        Wallet savedWallet = Wallet.builder()
                .walletId(30L)
                .userId(currentUserId)
                .walletName("Ví Cá Nhân")
                .balance(new BigDecimal("50000.00"))
                .isActive(true)
                .build();

        when(walletRepository.save(walletCaptor.capture())).thenReturn(savedWallet);

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(currentUserId, request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(currentUserId);

        Wallet captured = walletCaptor.getValue();
        assertThat(captured.getUserId()).isEqualTo(currentUserId);
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Tạo ví với số dư âm -> Thất bại qua Bean Validation và Service check")
    void createWallet_withNegativeBalance_shouldFailValidation() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Âm Tiền")
                .balance(new BigDecimal("-1000.00"))
                .build();

        // 2. Act (When) & 3. Assert (Then) Phía Bean Validation
        Set<ConstraintViolation<WalletCreateRequest>> violations = validator.validate(request);
        assertThat(violations).isNotEmpty();
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Số dư không được âm");

        // Đồng thời phía Service cũng ném IllegalArgumentException nếu dữ liệu âm
        assertThatThrownBy(() -> walletService.createWallet(userId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Số dư không được âm");

        verify(walletRepository, never()).save(any(Wallet.class));
    }
}

