package com.muzammil.projects.airBnbApp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateInventoryRequestDto {
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    @NotNull @DecimalMin("1.0")
    private BigDecimal surgeFactor;
    @NotNull
    private Boolean closed;
}
