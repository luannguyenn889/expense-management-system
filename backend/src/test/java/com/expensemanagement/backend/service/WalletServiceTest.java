package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.entity.Wallet;
import com.expensemanagement.backend.exception.DuplicateResourceException;
import com.expensemanagement.backend.exception.UnauthorizedException;
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
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
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

    @Test
    @DisplayName("Tạo ví với số dư vượt quá giới hạn CSDL (15,2) -> Thất bại qua Bean Validation và Service check")
    void createWallet_withExcessiveBalance_shouldFailValidation() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Tiền Khổng Lồ")
                .balance(new BigDecimal("10000000000000.00")) // 10 nghìn tỷ (14 chữ số phần nguyên)
                .build();

        // 2. Act (When) & 3. Assert (Then) Phía Bean Validation
        Set<ConstraintViolation<WalletCreateRequest>> violations = validator.validate(request);
        assertThat(violations).isNotEmpty();
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Số dư ban đầu không được vượt quá 9.999.999.999.999 đ");

        // Đồng thời phía Service cũng ném IllegalArgumentException nếu dữ liệu quá lớn
        assertThatThrownBy(() -> walletService.createWallet(userId, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Số dư ban đầu không được vượt quá 9.999.999.999.999 đ");

        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Tạo ví trùng cả tên ví và loại ví cho cùng người dùng -> Ném DuplicateResourceException (409)")
    void createWallet_withDuplicateNameAndType_shouldThrowDuplicateResourceException() {
        // 1. Arrange (Given)
        Long userId = 1L;
        String walletName = "Ví Tiết Kiệm";
        String walletType = "BANK_ACCOUNT";
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName(walletName)
                .walletType(walletType)
                .balance(new BigDecimal("500000.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, walletName, walletType))
                .thenReturn(true);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> walletService.createWallet(userId, request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Ví có cùng tên và loại đã tồn tại trong tài khoản của bạn");

        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Tạo ví cùng tên nhưng khác loại ví cho cùng người dùng -> Thành công không bị trùng lặp")
    void createWallet_withSameNameDifferentType_shouldCreateSuccessfully() {
        // 1. Arrange (Given)
        Long userId = 1L;
        String walletName = "Ví Tiêu Dùng";
        String walletType = "MOMO";
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName(walletName)
                .walletType(walletType)
                .balance(new BigDecimal("200000.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, walletName, walletType))
                .thenReturn(false);

        Wallet savedWallet = Wallet.builder()
                .walletId(99L)
                .userId(userId)
                .walletName(walletName)
                .walletType(walletType)
                .balance(new BigDecimal("200000.00"))
                .isActive(true)
                .build();

        when(walletRepository.save(any(Wallet.class))).thenReturn(savedWallet);

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(response).isNotNull();
        assertThat(response.getWalletName()).isEqualTo(walletName);
        assertThat(response.getWalletType()).isEqualTo(walletType);
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    // =========================================================================
    // US5 [CNTT46-41]: UNIT TEST CHO CHỨC NĂNG XEM DANH SÁCH VÍ
    // =========================================================================

    @Test
    @DisplayName("US5 [CNTT46-41]: Lấy danh sách ví khi người dùng có ví -> Trả về danh sách WalletResponse theo thứ tự mới nhất")
    void getWalletsByUser_whenUserHasWallets_shouldReturnList() {
        // 1. Arrange (Given)
        Long userId = 1L;
        LocalDateTime now = LocalDateTime.now();

        Wallet newestWallet = Wallet.builder()
                .walletId(11L)
                .userId(userId)
                .walletName("Ví Ngân Hàng")
                .balance(new BigDecimal("2000000.00"))
                .isActive(true)
                .createdAt(now)
                .build();

        Wallet olderWallet = Wallet.builder()
                .walletId(10L)
                .userId(userId)
                .walletName("Ví Tiền Mặt")
                .balance(new BigDecimal("500000.00"))
                .isActive(true)
                .createdAt(now.minusDays(1))
                .build();

        when(walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(newestWallet, olderWallet));

        // 2. Act (When)
        List<WalletResponse> result = walletService.getWalletsByUser(userId);

        // 3. Assert (Then)
        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getWalletId()).isEqualTo(11L);
        assertThat(result.get(0).getWalletName()).isEqualTo("Ví Ngân Hàng");
        assertThat(result.get(0).getBalance()).isEqualByComparingTo("2000000.00");
        assertThat(result.get(1).getWalletId()).isEqualTo(10L);
        assertThat(result.get(1).getWalletName()).isEqualTo("Ví Tiền Mặt");

        verify(walletRepository, times(1)).findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: Lấy danh sách ví khi người dùng chưa có ví -> Trả về danh sách rỗng []")
    void getWalletsByUser_whenNoWallet_shouldReturnEmptyList() {
        // 1. Arrange (Given)
        Long userId = 2L;
        when(walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId))
                .thenReturn(Collections.emptyList());

        // 2. Act (When)
        List<WalletResponse> result = walletService.getWalletsByUser(userId);

        // 3. Assert (Then)
        assertThat(result).isNotNull().isEmpty();
        verify(walletRepository, times(1)).findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: Bảo mật dữ liệu -> Chỉ truy vấn ví thuộc về đúng userId hiện tại")
    void getWalletsByUser_shouldQueryOnlyCurrentUserId() {
        // 1. Arrange (Given)
        Long currentUserId = 99L;
        when(walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(currentUserId))
                .thenReturn(Collections.emptyList());

        // 2. Act (When)
        walletService.getWalletsByUser(currentUserId);

        // 3. Assert (Then)
        verify(walletRepository, times(1)).findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(currentUserId);
        verifyNoMoreInteractions(walletRepository);
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: Lấy danh sách ví khi chưa đăng nhập (userId null) -> Ném UnauthorizedException (401)")
    void getWalletsByUser_whenUserIdIsNull_shouldThrowUnauthorizedException() {
        // 1. Arrange, 2. Act & 3. Assert
        assertThatThrownBy(() -> walletService.getWalletsByUser(null))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Vui lòng đăng nhập để thực hiện chức năng này");

        verifyNoInteractions(walletRepository);
    }
}
