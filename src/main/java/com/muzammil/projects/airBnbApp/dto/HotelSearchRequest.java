package com.muzammil.projects.airBnbApp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;

@Data
public class HotelSearchRequest {
    @NotBlank
    private String city;
    @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;
    @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
    @NotNull @Min(1) @Max(20)
    private Integer roomsCount = 1;

    @Min(0)
    private Integer page=0;
    @Min(1) @Max(50)
    private Integer size=10;
}
