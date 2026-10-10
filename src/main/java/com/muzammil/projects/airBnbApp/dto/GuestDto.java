package com.muzammil.projects.airBnbApp.dto;

import com.muzammil.projects.airBnbApp.entity.User;
import com.muzammil.projects.airBnbApp.entity.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GuestDto {
    private Long id;
    @NotBlank @Size(max = 100)
    private String name;
    private Gender gender;
    private LocalDate dateOfBirth;
}
