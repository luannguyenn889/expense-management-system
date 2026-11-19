package com.expensemanagement.backend.controller;

import com.expensemanagement.backend.DTO.request.WalletCreateRequest;
import com.expensemanagement.backend.DTO.response.WalletResponse;
import com.expensemanagement.backend.exception.DuplicateResourceException;
import com.expensemanagement.backend.exception.UnauthorizedException;
import com.expensemanagement.backend.service.WalletService;
import com.expensemanagement.backend.util.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @Value("${jwt.secret}")
    private String jwtSecret;

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

    @Test
    @DisplayName("POST /api/v1/wallets với walletName > 100 ký tự -> Trả về HTTP 400 Bad Request")
    void createWallet_withWalletNameExceeding100Chars_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("W".repeat(101))
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Tên ví tối đa 100 ký tự"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với walletType > 30 ký tự -> Trả về HTTP 400 Bad Request")
    void createWallet_withWalletTypeExceeding30Chars_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Hợp Lệ")
                .walletType("T".repeat(31))
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Loại ví tối đa 30 ký tự"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với balance null -> Hợp lệ và trả về HTTP 201 Created")
    void createWallet_withNullBalance_shouldReturn201Created() throws Exception {
        // 1. Arrange (Given)
        Long userId = 1L;
        String token = jwtTokenProvider.generateToken(userId);
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Không Nhập Tiền")
                .walletType("CASH")
                .balance(null)
                .build();

        WalletResponse mockResponse = WalletResponse.builder()
                .walletId(22L)
                .userId(userId)
                .walletName("Ví Không Nhập Tiền")
                .walletType("CASH")
                .balance(BigDecimal.ZERO)
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
                .andExpect(jsonPath("$.data.balance").value(0));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với balance có số thập phân -> Hợp lệ và giữ nguyên số thập phân")
    void createWallet_withDecimalBalance_shouldReturn201Created() throws Exception {
        // 1. Arrange (Given)
        Long userId = 1L;
        String token = jwtTokenProvider.generateToken(userId);
        BigDecimal decimalBalance = new BigDecimal("12345.67");
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Thập Phân")
                .walletType("MOMO")
                .balance(decimalBalance)
                .build();

        WalletResponse mockResponse = WalletResponse.builder()
                .walletId(23L)
                .userId(userId)
                .walletName("Ví Thập Phân")
                .walletType("MOMO")
                .balance(decimalBalance)
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
                .andExpect(jsonPath("$.data.balance").value(12345.67));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với JWT sai chữ ký / không hợp lệ -> Bị chặn với HTTP 403 Forbidden")
    void createWallet_withInvalidJwtToken_shouldReturn403Forbidden() throws Exception {
        // 1. Arrange (Given)
        WalletCreateRequest request = WalletCreateRequest.builder()
                .walletName("Ví Token Giả")
                .balance(BigDecimal.ZERO)
                .build();

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer invalid.jwt.signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/wallets với body JSON rỗng {} -> Trả về HTTP 400 Bad Request")
    void createWallet_withEmptyJsonBody_shouldReturn400BadRequest() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Tên ví không được để trống"));
    }

    @Test
    @DisplayName("POST /api/v1/wallets với JSON sai cú pháp -> GlobalExceptionHandler bắt lỗi và trả về JSON có message")
    void createWallet_withMalformedJson_shouldReturnErrorResponse() throws Exception {
        // 1. Arrange (Given)
        String token = jwtTokenProvider.generateToken(1L);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(post("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"walletName\": "))
                .andExpect(status().is5xxServerError())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    // =========================================================================
    // US5 [CNTT46-41]: UNIT TEST MOCKMVC CHO GET /api/v1/wallets
    // =========================================================================

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets kèm JWT hợp lệ -> Trả về HTTP 200 OK và danh sách ví")
    void getWallets_withValidTokenAndWallets_shouldReturn200Ok() throws Exception {
        // 1. Arrange (Given)
        Long userId = 1L;
        String token = jwtTokenProvider.generateToken(userId);
        List<WalletResponse> mockWallets = List.of(
                WalletResponse.builder()
                        .walletId(11L)
                        .userId(userId)
                        .walletName("Ví Ngân Hàng")
                        .walletType("BANK_ACCOUNT")
                        .balance(new BigDecimal("2000000.00"))
                        .isActive(true)
                        .build(),
                WalletResponse.builder()
                        .walletId(10L)
                        .userId(userId)
                        .walletName("Ví Tiền Mặt")
                        .walletType("CASH")
                        .balance(new BigDecimal("500000.00"))
                        .isActive(true)
                        .build()
        );
        when(walletService.getWalletsByUser(userId)).thenReturn(mockWallets);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].walletId").value(11))
                .andExpect(jsonPath("$.data[0].walletName").value("Ví Ngân Hàng"))
                .andExpect(jsonPath("$.data[0].walletType").value("BANK_ACCOUNT"))
                .andExpect(jsonPath("$.data[0].balance").value(2000000.00))
                .andExpect(jsonPath("$.data[1].walletId").value(10))
                .andExpect(jsonPath("$.data[1].walletName").value("Ví Tiền Mặt"));
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets khi người dùng chưa có ví -> Trả về HTTP 200 OK với mảng rỗng []")
    void getWallets_whenNoWallets_shouldReturn200OkWithEmptyArray() throws Exception {
        // 1. Arrange (Given)
        Long userId = 2L;
        String token = jwtTokenProvider.generateToken(userId);
        when(walletService.getWalletsByUser(userId)).thenReturn(Collections.emptyList());

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets -> Trích xuất đúng userId từ JWT và truyền xuống WalletService")
    void getWallets_withValidToken_shouldPassExtractedUserIdToService() throws Exception {
        // 1. Arrange (Given)
        Long targetUserId = 77L;
        String token = jwtTokenProvider.generateToken(targetUserId);
        when(walletService.getWalletsByUser(targetUserId)).thenReturn(Collections.emptyList());

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        verify(walletService).getWalletsByUser(targetUserId);
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets không có JWT token -> Bị chặn với HTTP 403 Forbidden")
    void getWallets_withoutToken_shouldReturn403Forbidden() throws Exception {
        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets với JWT sai chữ ký -> Bị chặn với HTTP 403 Forbidden")
    void getWallets_withInvalidSignatureToken_shouldReturn403Forbidden() throws Exception {
        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer invalid.jwt.signature"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets với JWT đã hết hạn -> Bị chặn với HTTP 403 Forbidden")
    void getWallets_withExpiredJwtToken_shouldReturn403Forbidden() throws Exception {
        // 1. Arrange (Given)
        JwtTokenProvider expiredProvider = new JwtTokenProvider(jwtSecret, -1000L);
        String expiredToken = expiredProvider.generateToken(1L);

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets với header Authorization không đúng định dạng Bearer -> Bị chặn HTTP 403")
    void getWallets_withMalformedAuthorizationHeader_shouldReturn403Forbidden() throws Exception {
        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Basic dXNlcjpwYXNz"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("US5 [CNTT46-41]: GET /api/v1/wallets khi Service ném UnauthorizedException -> Trả về HTTP 401 Unauthorized")
    void getWallets_whenServiceThrowsUnauthorized_shouldReturn401Unauthorized() throws Exception {
        // 1. Arrange (Given)
        Long userId = 1L;
        String token = jwtTokenProvider.generateToken(userId);
        when(walletService.getWalletsByUser(userId))
                .thenThrow(new UnauthorizedException("Vui lòng đăng nhập để thực hiện chức năng này"));

        // 2. Act (When) & 3. Assert (Then)
        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("Vui lòng đăng nhập để thực hiện chức năng này"));
    }
}
