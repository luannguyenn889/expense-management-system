package com.expensemanagement.backend.repository;

import com.expensemanagement.backend.entity.Wallet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class WalletRepositoryTest {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("existsByUserIdAndWalletNameIgnoreCaseAndWalletType khớp chính xác -> Trả về true")
    void existsByUserIdAndWalletNameIgnoreCaseAndWalletType_whenExactMatch_shouldReturnTrue() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(1L)
                .walletName("Ví Tiết Kiệm")
                .walletType("BANK_ACCOUNT")
                .balance(new BigDecimal("100000.00"))
                .build());

        // 2. Act (When)
        boolean exists = walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(
                1L, "Ví Tiết Kiệm", "BANK_ACCOUNT");

        // 3. Assert (Then)
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsByUserIdAndWalletNameIgnoreCaseAndWalletType khác hoa/thường -> Vẫn trả về true")
    void existsByUserIdAndWalletNameIgnoreCaseAndWalletType_whenDifferentCase_shouldReturnTrue() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(1L)
                .walletName("Ví Tiết Kiệm")
                .walletType("CASH")
                .balance(BigDecimal.ZERO)
                .build());

        // 2. Act (When)
        boolean exists = walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(
                1L, "ví tiết kiệm", "CASH");

        // 3. Assert (Then)
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsByUserIdAndWalletNameIgnoreCaseAndWalletType cùng tên nhưng khác loại ví -> Trả về false")
    void existsByUserIdAndWalletNameIgnoreCaseAndWalletType_whenDifferentType_shouldReturnFalse() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(1L)
                .walletName("Chi Tiêu")
                .walletType("CASH")
                .balance(BigDecimal.ZERO)
                .build());

        // 2. Act (When)
        boolean exists = walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(
                1L, "Chi Tiêu", "MOMO");

        // 3. Assert (Then)
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("existsByUserIdAndWalletNameIgnoreCaseAndWalletType cùng tên & loại nhưng khác userId -> Trả về false")
    void existsByUserIdAndWalletNameIgnoreCaseAndWalletType_whenDifferentUser_shouldReturnFalse() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(1L)
                .walletName("Ví Chung")
                .walletType("CASH")
                .balance(BigDecimal.ZERO)
                .build());

        // 2. Act (When)
        boolean exists = walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(
                2L, "Ví Chung", "CASH");

        // 3. Assert (Then)
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("findByWalletIdAndUserId khi đúng chủ sở hữu -> Trả về Optional chứa Wallet")
    void findByWalletIdAndUserId_whenOwnerMatches_shouldReturnWallet() {
        // 1. Arrange (Given)
        Wallet saved = walletRepository.saveAndFlush(Wallet.builder()
                .userId(1L)
                .walletName("Ví Cá Nhân")
                .walletType("MOMO")
                .balance(new BigDecimal("50000.00"))
                .build());

        // 2. Act (When)
        Optional<Wallet> found = walletRepository.findByWalletIdAndUserId(saved.getWalletId(), 1L);

        // 3. Assert (Then)
        assertThat(found).isPresent();
        assertThat(found.get().getWalletName()).isEqualTo("Ví Cá Nhân");
    }

    @Test
    @DisplayName("findByWalletIdAndUserId khi không phải chủ sở hữu -> Trả về Optional.empty()")
    void findByWalletIdAndUserId_whenNotOwner_shouldReturnEmpty() {
        // 1. Arrange (Given)
        Wallet saved = walletRepository.saveAndFlush(Wallet.builder()
                .userId(1L)
                .walletName("Ví Riêng Tư")
                .walletType("CASH")
                .balance(BigDecimal.ZERO)
                .build());

        // 2. Act (When)
        Optional<Wallet> found = walletRepository.findByWalletIdAndUserId(saved.getWalletId(), 99L);

        // 3. Assert (Then)
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("saveAndFlush Wallet -> Tự động gán giá trị mặc định và timestamps createdAt, updatedAt")
    void saveWallet_shouldAutoPopulateTimestampsAndDefaultValues() {
        // 1. Arrange (Given)
        Wallet wallet = Wallet.builder()
                .userId(1L)
                .walletName("Ví Mặc Định")
                .build();

        // 2. Act (When)
        Wallet saved = walletRepository.saveAndFlush(wallet);

        // 3. Assert (Then)
        assertThat(saved.getWalletId()).isNotNull();
        assertThat(saved.getWalletType()).isEqualTo("CASH");
        assertThat(saved.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(saved.getIsActive()).isTrue();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    // =========================================================================
    // US5 [CNTT46-41]: UNIT TEST JPA QUERY DANH SÁCH VÍ
    // =========================================================================

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserIdAndIsActiveTrueOrderByCreatedAtDesc -> Sắp xếp ví mới nhất lên đầu")
    void findByUserIdAndIsActiveTrueOrderByCreatedAtDesc_shouldReturnNewestFirst() {
        // 1. Arrange (Given)
        Wallet older = walletRepository.saveAndFlush(Wallet.builder()
                .userId(10L)
                .walletName("Ví Cũ")
                .walletType("CASH")
                .balance(new BigDecimal("100000.00"))
                .isActive(true)
                .build());
        Wallet newer = walletRepository.saveAndFlush(Wallet.builder()
                .userId(10L)
                .walletName("Ví Mới")
                .walletType("BANK_ACCOUNT")
                .balance(new BigDecimal("500000.00"))
                .isActive(true)
                .build());

        // Đặt rõ created_at cách nhau 1 ngày để tránh trùng millisecond trên H2
        entityManager.getEntityManager()
                .createNativeQuery("UPDATE wallets SET created_at = :ts WHERE wallet_id = :id")
                .setParameter("ts", LocalDateTime.of(2026, 11, 1, 8, 0))
                .setParameter("id", older.getWalletId())
                .executeUpdate();
        entityManager.getEntityManager()
                .createNativeQuery("UPDATE wallets SET created_at = :ts WHERE wallet_id = :id")
                .setParameter("ts", LocalDateTime.of(2026, 11, 2, 8, 0))
                .setParameter("id", newer.getWalletId())
                .executeUpdate();
        entityManager.flush();
        entityManager.clear();

        // 2. Act (When)
        List<Wallet> wallets = walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(10L);

        // 3. Assert (Then)
        assertThat(wallets).hasSize(2);
        assertThat(wallets.get(0).getWalletName()).isEqualTo("Ví Mới");
        assertThat(wallets.get(1).getWalletName()).isEqualTo("Ví Cũ");
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserIdAndIsActiveTrueOrderByCreatedAtDesc -> Loại bỏ các ví đã ngừng sử dụng (isActive = false)")
    void findByUserIdAndIsActiveTrueOrderByCreatedAtDesc_shouldExcludeInactiveWallets() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(11L)
                .walletName("Ví Đang Hoạt Động")
                .walletType("CASH")
                .balance(new BigDecimal("200000.00"))
                .isActive(true)
                .build());
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(11L)
                .walletName("Ví Đã Ngừng")
                .walletType("MOMO")
                .balance(new BigDecimal("50000.00"))
                .isActive(false)
                .build());

        // 2. Act (When)
        List<Wallet> wallets = walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(11L);

        // 3. Assert (Then)
        assertThat(wallets).hasSize(1);
        assertThat(wallets.get(0).getWalletName()).isEqualTo("Ví Đang Hoạt Động");
        assertThat(wallets.get(0).getIsActive()).isTrue();
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserIdAndIsActiveTrueOrderByCreatedAtDesc -> Tách biệt hoàn toàn dữ liệu theo userId")
    void findByUserIdAndIsActiveTrueOrderByCreatedAtDesc_shouldIsolateByUserId() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(21L)
                .walletName("Ví User 21")
                .walletType("CASH")
                .balance(new BigDecimal("300000.00"))
                .isActive(true)
                .build());
        walletRepository.saveAndFlush(Wallet.builder()
                .userId(22L)
                .walletName("Ví User 22")
                .walletType("BANK_ACCOUNT")
                .balance(new BigDecimal("900000.00"))
                .isActive(true)
                .build());

        // 2. Act (When)
        List<Wallet> user21Wallets = walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(21L);

        // 3. Assert (Then)
        assertThat(user21Wallets).hasSize(1);
        assertThat(user21Wallets.get(0).getUserId()).isEqualTo(21L);
        assertThat(user21Wallets.get(0).getWalletName()).isEqualTo("Ví User 21");
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserIdAndIsActiveTrueOrderByCreatedAtDesc khi user chưa có ví -> Trả về danh sách rỗng")
    void findByUserIdAndIsActiveTrueOrderByCreatedAtDesc_whenNoWallets_shouldReturnEmptyList() {
        // 2. Act (When)
        List<Wallet> wallets = walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(999L);

        // 3. Assert (Then)
        assertThat(wallets).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserIdAndIsActiveTrue -> Chỉ trả về các ví đang hoạt động của đúng user")
    void findByUserIdAndIsActiveTrue_shouldReturnOnlyActiveWalletsForUser() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder().userId(31L).walletName("Active 1").walletType("CASH").isActive(true).build());
        walletRepository.saveAndFlush(Wallet.builder().userId(31L).walletName("Active 2").walletType("MOMO").isActive(true).build());
        walletRepository.saveAndFlush(Wallet.builder().userId(31L).walletName("Inactive 1").walletType("BANK_ACCOUNT").isActive(false).build());
        walletRepository.saveAndFlush(Wallet.builder().userId(32L).walletName("Other User Active").walletType("CASH").isActive(true).build());

        // 2. Act (When)
        List<Wallet> result = walletRepository.findByUserIdAndIsActiveTrue(31L);

        // 3. Assert (Then)
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Wallet::getWalletName).containsExactlyInAnyOrder("Active 1", "Active 2");
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserId -> Trả về cả ví đang hoạt động lẫn ví đã ngừng sử dụng của user")
    void findByUserId_shouldReturnAllWalletsIncludingInactiveForUser() {
        // 1. Arrange (Given)
        walletRepository.saveAndFlush(Wallet.builder().userId(41L).walletName("Ví Active").walletType("CASH").isActive(true).build());
        walletRepository.saveAndFlush(Wallet.builder().userId(41L).walletName("Ví Inactive").walletType("MOMO").isActive(false).build());
        walletRepository.saveAndFlush(Wallet.builder().userId(42L).walletName("Ví User Khác").walletType("CASH").isActive(true).build());

        // 2. Act (When)
        List<Wallet> result = walletRepository.findByUserId(41L);

        // 3. Assert (Then)
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Wallet::getWalletName).containsExactlyInAnyOrder("Ví Active", "Ví Inactive");
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: findByUserId khi user không có ví nào -> Trả về danh sách rỗng")
    void findByUserId_whenUserHasNoWallets_shouldReturnEmptyList() {
        // 2. Act (When)
        List<Wallet> result = walletRepository.findByUserId(888L);

        // 3. Assert (Then)
        assertThat(result).isNotNull().isEmpty();
    }
}
