package com.expensemanagement.backend.controller;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.ApiResponse;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.service.WalletService;
import com.expensemanagement.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(@Valid @RequestBody WalletCreateRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        WalletResponse response = walletService.createWallet(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo ví thành công", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getWallets() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<WalletResponse> wallets = walletService.getWalletsByUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(wallets));
    }
}

