package com.example.agri_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProduceLotDTO {
    private Long lotId;

    @NotNull
    private Long farmerId;

    @NotBlank
    private String cropType;

    @NotNull @Positive
    private Double quantity;

    @NotBlank
    private String unit;

    private LocalDate harvestDate;
    private String qualityGrade;
    private Double availableQuantity;
}
