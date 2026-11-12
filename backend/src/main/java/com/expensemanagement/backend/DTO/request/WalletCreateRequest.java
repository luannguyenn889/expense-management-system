package com.expensemanagement.backend.DTO.request;

import jakarta.validation.constraints.DecimalMax;
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

    @Size(max = 30, message = "Loại ví tối đa 30 ký tự")
    private String walletType;

    @DecimalMin(value = "0.00", message = "Số dư không được âm")
    @DecimalMax(value = "9999999999999.99", message = "Số dư ban đầu không được vượt quá 9.999.999.999.999 đ")
    private BigDecimal balance;
}

