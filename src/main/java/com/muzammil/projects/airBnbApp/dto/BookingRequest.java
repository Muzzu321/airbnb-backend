package com.muzammil.projects.airBnbApp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull
    private Long hotelId;
    @NotNull
    private Long roomId;
    @NotNull
    private LocalDate checkInDate;
    @NotNull
    private LocalDate checkOutDate;
    @NotNull @Min(1) @Max(20)
    private Integer roomsCount;
}
