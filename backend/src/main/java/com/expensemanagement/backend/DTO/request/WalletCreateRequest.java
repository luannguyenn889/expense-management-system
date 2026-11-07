package com.expensemanagement.backend.DTO.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletCreateRequest {

    @NotBlank(message = "Tên ví không được để trống")
    @Size(max = 100, message = "Tên ví tối đa 100 ký tự")
    private String walletName;

    @DecimalMin(value = "0.00", message = "Số dư không được âm")
    private BigDecimal balance;
}

