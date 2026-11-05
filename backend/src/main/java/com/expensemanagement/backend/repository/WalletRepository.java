package com.expensemanagement.backend.repository;

import com.expensemanagement.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserIdAndIsActiveTrue(Long userId);

    List<Wallet> findByUserId(Long userId);

    Optional<Wallet> findByWalletIdAndUserId(Long walletId, Long userId);
}

