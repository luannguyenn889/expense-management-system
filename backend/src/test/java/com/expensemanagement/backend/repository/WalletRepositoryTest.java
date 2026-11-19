package com.expensemanagement.backend.repository;

import com.expensemanagement.backend.entity.Wallet;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class WalletRepositoryTest {

    @Autowired
    private WalletRepository walletRepository;

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
}
