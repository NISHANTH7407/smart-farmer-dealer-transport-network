package com.example.agri_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransporterDTO {
    private Long transporterId;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String vehicleDetails;
}
