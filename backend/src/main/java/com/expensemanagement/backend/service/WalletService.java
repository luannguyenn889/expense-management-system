package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.entity.Wallet;
import com.expensemanagement.backend.exception.UnauthorizedException;
import com.expensemanagement.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional
    public WalletResponse createWallet(Long userId, WalletCreateRequest request) {
        if (userId == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện chức năng này");
        }

        BigDecimal initialBalance = (request.getBalance() != null) ? request.getBalance() : BigDecimal.ZERO;
        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Số dư không được âm");
        }

        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletName(request.getWalletName().trim())
                .balance(initialBalance)
                .isActive(true)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);
        return mapToWalletResponse(savedWallet);
    }

    public List<WalletResponse> getWalletsByUser(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện chức năng này");
        }

        return walletRepository.findByUserIdAndIsActiveTrue(userId).stream()
                .map(this::mapToWalletResponse)
                .collect(Collectors.toList());
    }

    private WalletResponse mapToWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUserId())
                .walletName(wallet.getWalletName())
                .balance(wallet.getBalance())
                .isActive(wallet.getIsActive())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}

