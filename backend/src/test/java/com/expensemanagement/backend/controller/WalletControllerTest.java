package com.expensemanagement.backend.controller;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.exception.DuplicateResourceException;
import com.expensemanagement.backend.service.WalletService;
import com.expensemanagement.backend.util.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private WalletService walletService;

    @Test
    @DisplayName("POST /api/v1/wallets hợp lệ kèm JWT -> Trả về HTTP 201 Created")
    void createWallet_withValidRequestAndToken_shouldReturn201Created() throws Exception {
        // 1. Arrange (Given)
        Long userId = 1L;
        String token = jwtTokenProvider.generateToken(userId);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Tiết Kiệm")
                .walletType("BANK_ACCOUNT")
                .balance(new BigDecimal("500000.00"))
                .build();

        WalletResponse mockResponse = WalletResponse.builder()
                .walletId(10L)
                .userId(userId)
                .walletName("Ví Tiết Kiệm")
                .walletType("BANK_ACCOUNT")
                .balance(new BigDecimal("500000.00"))
                .isActive(true)
                .build();

        when(walletService.createWallet(eq(userId), any(WalletCreateRequest.class))).thenReturn(mockResponse);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.message").value("Tạo ví thành công"))
                .andExpect(jsonPath("$.data.walletId").value(10))
                .andExpect(jsonPath("$.data.walletName").value("Ví Tiết Kiệm"))
                .andExpect(jsonPath("$.data.walletType").value("BANK_ACCOUNT"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets không có JWT token -> Bị chặn với HTTP 403 Forbidden")
    void createWallet_withoutToken_shouldReturn403Forbidden() throws Exception {
        // 1. Arrange (Given)
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Không Token")
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/wallets với tên ví rỗng -> Trả về HTTP 400 Bad Request")
    void createWallet_withBlankWalletName_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("   ")
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Tên ví không được để trống"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với số dư âm -> Trả về HTTP 400 Bad Request")
    void createWallet_withNegativeBalance_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Âm")
                .balance(new BigDecimal("-100.00"))
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Số dư không được âm"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với số dư vượt quá giới hạn -> Trả về HTTP 400 Bad Request")
    void createWallet_withExcessiveBalance_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Quá Lớn")
                .balance(new BigDecimal("10000000000000.00"))
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Số dư ban đầu không được vượt quá 9.999.999.999.999 đ"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets bị trùng tên và loại ví -> Trả về HTTP 409 Conflict")
    void createWallet_whenDuplicateNameAndType_shouldReturn409Conflict() throws Exception {
        // 1. Arrange (Given)
        Long userId = 1L;
        String token = jwtTokenProvider.generateToken(userId);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Trùng")
                .walletType("CASH")
                .balance(BigDecimal.ZERO)
                .build();

        when(walletService.createWallet(eq(userId), any(WalletCreateRequest.class)))
                .thenThrow(new DuplicateResourceException("Ví có cùng tên và loại đã tồn tại trong tài khoản của bạn"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("Ví có cùng tên và loại đã tồn tại trong tài khoản của bạn"));
    }
}
