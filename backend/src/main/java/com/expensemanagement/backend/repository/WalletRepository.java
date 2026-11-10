package com.expensemanagement.backend.repository;

import com.expensemanagement.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserIdAndIsActiveTrue(Long userId);

    /**
     * US5 [CNTT46-41]: Truy vấn danh sách ví đang hoạt động theo userId,
     * sắp xếp giảm dần theo thời gian tạo (ví mới nhất lên đầu).
     */
    List<Wallet> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);

    List<Wallet> findByUserId(Long userId);

    Optional<Wallet> findByWalletIdAndUserId(Long walletId, Long userId);

    boolean existsByUserIdAndWalletNameIgnoreCaseAndWalletType(Long userId, String walletName, String walletType);
}
