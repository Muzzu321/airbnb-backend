package com.muzammil.projects.airBnbApp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDto {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
