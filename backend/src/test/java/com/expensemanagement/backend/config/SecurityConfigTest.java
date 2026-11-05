package com.expensemanagement.backend.config;

import com.expensemanagement.backend.util.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Endpoint công khai /api/health truy cập được không cần token (HTTP 200)")
    void publicEndpoint_withoutToken_shouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Endpoint bảo vệ truy cập KHÔNG CÓ token bị chặn (HTTP 401 hoặc 403)")
    void protectedEndpoint_withoutToken_shouldBeUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/wallets"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Endpoint bảo vệ với Bearer token hợp lệ được phép đi tiếp")
    void protectedEndpoint_withValidToken_shouldPassAuthentication() throws Exception {
        String token = jwtTokenProvider.generateToken(1L);

        mockMvc.perform(get("/api/v1/wallets")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
