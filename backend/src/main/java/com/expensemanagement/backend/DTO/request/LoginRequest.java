package com.expensemanagement.backend.DTO.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    private String username;

    private String email;

    private String usernameOrEmail;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    public String getIdentifier() {
        if (usernameOrEmail != null && !usernameOrEmail.isBlank()) {
            return usernameOrEmail.trim();
        }
        if (username != null && !username.isBlank()) {
            return username.trim();
        }
        if (email != null && !email.isBlank()) {
            return email.trim();
        }
        return null;
    }
}
