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

    @Test
    @DisplayName("Tạo ví khi chưa đăng nhập (userId null) -> Ném UnauthorizedException (401)")
    void createWallet_whenUserIdIsNull_shouldThrowUnauthorizedException() {
        // 1. Arrange (Given)
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Mới")
                .balance(new BigDecimal("100000.00"))
                .build();

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> walletService.createWallet(null, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Vui lòng đăng nhập để thực hiện chức năng này");

        verifyNoInteractions(walletRepository);
    }

    @Test
    @DisplayName("Tạo ví với tên có khoảng trắng 2 đầu -> Tự động trim trước khi kiểm tra trùng và lưu DB")
    void createWallet_withSpacesAroundWalletName_shouldTrimBeforeCheckAndSave() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("  Ví Tiết Kiệm  ")
                .walletType("CASH")
                .balance(new BigDecimal("100000.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Tiết Kiệm", "CASH"))
                .thenReturn(false);

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        when(walletRepository.save(walletCaptor.capture())).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setWalletId(101L);
            return w;
        });

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(walletCaptor.getValue().getWalletName()).isEqualTo("Ví Tiết Kiệm");
        assertThat(response.getWalletName()).isEqualTo("Ví Tiết Kiệm");
        verify(walletRepository, times(1))
                .existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Tiết Kiệm", "CASH");
    }

    @Test
    @DisplayName("Tạo ví không truyền walletType (null) -> Mặc định loại ví là CASH")
    void createWallet_withoutWalletType_shouldDefaultToCash() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Không Loại")
                .walletType(null)
                .balance(new BigDecimal("50000.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Không Loại", "CASH"))
                .thenReturn(false);

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        when(walletRepository.save(walletCaptor.capture())).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setWalletId(102L);
            return w;
        });

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(walletCaptor.getValue().getWalletType()).isEqualTo("CASH");
        assertThat(response.getWalletType()).isEqualTo("CASH");
    }

    @Test
    @DisplayName("Tạo ví với walletType toàn khoảng trắng -> Mặc định loại ví là CASH")
    void createWallet_withBlankWalletType_shouldDefaultToCash() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Khoảng Trắng")
                .walletType("   ")
                .balance(new BigDecimal("50000.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Khoảng Trắng", "CASH"))
                .thenReturn(false);

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        when(walletRepository.save(walletCaptor.capture())).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setWalletId(103L);
            return w;
        });

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(walletCaptor.getValue().getWalletType()).isEqualTo("CASH");
        assertThat(response.getWalletType()).isEqualTo("CASH");
    }

    @Test
    @DisplayName("Tạo ví với walletType viết thường và có khoảng trắng -> Chuẩn hóa trim và viết hoa")
    void createWallet_withLowercaseAndSpacesWalletType_shouldTrimAndUppercase() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Ngân Hàng")
                .walletType("  bank_account  ")
                .balance(new BigDecimal("300000.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Ngân Hàng", "BANK_ACCOUNT"))
                .thenReturn(false);

        ArgumentCaptor<Wallet> walletCaptor = ArgumentCaptor.forClass(Wallet.class);
        when(walletRepository.save(walletCaptor.capture())).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setWalletId(104L);
            return w;
        });

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(walletCaptor.getValue().getWalletType()).isEqualTo("BANK_ACCOUNT");
        assertThat(response.getWalletType()).isEqualTo("BANK_ACCOUNT");
    }

    @Test
    @DisplayName("Tạo ví với số dư biên chính xác bằng 0.00 -> Tạo ví thành công")
    void createWallet_withExactZeroBalance_shouldSucceed() {
        // 1. Arrange (Given)
        Long userId = 1L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Số Dư 0")
                .walletType("CASH")
                .balance(new BigDecimal("0.00"))
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Số Dư 0", "CASH"))
                .thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setWalletId(105L);
            return w;
        });

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(response.getBalance()).isEqualByComparingTo("0.00");
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Tạo ví với số dư biên tối đa 9999999999999.99 -> Tạo ví thành công")
    void createWallet_withExactMaxBalance_shouldSucceed() {
        // 1. Arrange (Given)
        Long userId = 1L;
        BigDecimal maxBalance = new BigDecimal("9999999999999.99");
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Tối Đa")
                .walletType("BANK_ACCOUNT")
                .balance(maxBalance)
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Tối Đa", "BANK_ACCOUNT"))
                .thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setWalletId(106L);
            return w;
        });

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(response.getBalance()).isEqualByComparingTo(maxBalance);
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    @DisplayName("Kiểm tra trùng ví dùng đúng tên đã trim và loại ví đã chuẩn hóa chữ hoa")
    void createWallet_whenDuplicateCheckRuns_shouldPassNormalizedNameAndType() {
        // 1. Arrange (Given)
        Long userId = 7L;
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("  Ví A  ")
                .walletType(" momo ")
                .balance(BigDecimal.TEN)
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví A", "MOMO"))
                .thenReturn(true);

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> walletService.createWallet(userId, request))
                .isInstanceOf(DuplicateResourceException.class);

        verify(walletRepository, times(1))
                .existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví A", "MOMO");
    }

    @Test
    @DisplayName("Tạo ví thành công -> Map đầy đủ tất cả trường WalletResponse bao gồm timestamps và isActive")
    void createWallet_shouldMapAllResponseFieldsCorrectly() {
        // 1. Arrange (Given)
        Long userId = 9L;
        LocalDateTime now = LocalDateTime.of(2026, 5, 10, 14, 30);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Đầy Đủ")
                .walletType("MOMO")
                .balance(new BigDecimal("250000.00"))
                .build();

        Wallet savedWallet = Wallet.builder()
                .walletId(107L)
                .userId(userId)
                .walletName("Ví Đầy Đủ")
                .walletType("MOMO")
                .balance(new BigDecimal("250000.00"))
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        when(walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, "Ví Đầy Đủ", "MOMO"))
                .thenReturn(false);
        when(walletRepository.save(any(Wallet.class))).thenReturn(savedWallet);

        // 2. Act (When)
        WalletResponse response = walletService.createWallet(userId, request);

        // 3. Assert (Then)
        assertThat(response.getWalletId()).isEqualTo(107L);
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getWalletName()).isEqualTo("Ví Đầy Đủ");
        assertThat(response.getWalletType()).isEqualTo("MOMO");
        assertThat(response.getBalance()).isEqualByComparingTo("250000.00");
        assertThat(response.getIsActive()).isTrue();
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Validation: WalletCreateRequest với tên ví rỗng -> Báo lỗi Tên ví không được để trống")
    void walletCreateRequest_withBlankWalletName_shouldFailValidation() {
        // 1. Arrange (Given)
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("   ")
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When)
        Set<ConstraintViolation<WalletCreateRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Tên ví không được để trống");
    }

    @Test
    @DisplayName("Validation: WalletCreateRequest với tên ví 101 ký tự -> Báo lỗi Tên ví tối đa 100 ký tự")
    void walletCreateRequest_withWalletNameExceeding100Chars_shouldFailValidation() {
        // 1. Arrange (Given)
        String longName = "A".repeat(101);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName(longName)
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When)
        Set<ConstraintViolation<WalletCreateRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Tên ví tối đa 100 ký tự");
    }

    @Test
    @DisplayName("Validation: WalletCreateRequest với tên ví đúng 100 ký tự -> Hợp lệ")
    void walletCreateRequest_withWalletNameExactly100Chars_shouldPassValidation() {
        // 1. Arrange (Given)
        String exactName = "A".repeat(100);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName(exactName)
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When)
        Set<ConstraintViolation<WalletCreateRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Validation: WalletCreateRequest với loại ví 31 ký tự -> Báo lỗi Loại ví tối đa 30 ký tự")
    void walletCreateRequest_withWalletTypeExceeding30Chars_shouldFailValidation() {
        // 1. Arrange (Given)
        String longType = "T".repeat(31);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Hợp Lệ")
                .walletType(longType)
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When)
        Set<ConstraintViolation<WalletCreateRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Loại ví tối đa 30 ký tự");
    }

    @Test
    @DisplayName("Validation: WalletCreateRequest với số dư biên 0.00 và 9999999999999.99 -> Hợp lệ")
    void walletCreateRequest_withValidBoundaryBalances_shouldPassValidation() {
        // 1. Arrange (Given)
        WalletCreateRequest minReq = WalletCreateRequest.builder()
                .walletName("Ví Min")
                .balance(new BigDecimal("0.00"))
                .build();
        WalletCreateRequest maxReq = WalletCreateRequest.builder()
                .walletName("Ví Max")
                .balance(new BigDecimal("9999999999999.99"))
                .build();

        // 2. Act (When) & 3. Assert (Then)
        assertThat(validator.validate(minReq)).isEmpty();
        assertThat(validator.validate(maxReq)).isEmpty();
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
