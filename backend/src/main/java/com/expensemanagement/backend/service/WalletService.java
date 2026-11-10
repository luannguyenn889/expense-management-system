package com.expensemanagement.backend.service;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.entity.Wallet;
import com.expensemanagement.backend.exception.DuplicateResourceException;
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

        String trimmedName = request.getWalletName().trim();
        String normalizedType = (request.getWalletType() != null && !request.getWalletType().isBlank())
                ? request.getWalletType().trim().toUpperCase()
                : "CASH";

        if (walletRepository.existsByUserIdAndWalletNameIgnoreCaseAndWalletType(userId, trimmedName, normalizedType)) {
            throw new DuplicateResourceException("Ví có cùng tên và loại đã tồn tại trong tài khoản của bạn");
        }

        Wallet wallet = Wallet.builder()
                .userId(userId)
                .walletName(trimmedName)
                .walletType(normalizedType)
                .balance(initialBalance)
                .isActive(true)
                .build();

        Wallet savedWallet = walletRepository.save(wallet);
        return mapToWalletResponse(savedWallet);
    }

    /**
     * US5 [CNTT46-41]: Lấy danh sách các ví đang hoạt động của người dùng hiện tại,
     * sắp xếp theo thời gian tạo giảm dần (ví mới nhất lên đầu).
     */
    public List<WalletResponse> getWalletsByUser(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện chức năng này");
        }

        return walletRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToWalletResponse)
                .collect(Collectors.toList());
    }

    private WalletResponse mapToWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUserId())
                .walletName(wallet.getWalletName())
                .walletType(wallet.getWalletType())
                .balance(wallet.getBalance())
                .isActive(wallet.getIsActive())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
