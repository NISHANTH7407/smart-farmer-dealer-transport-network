package com.example.agri_backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PurchaseItemDTO {
    private Long purchaseItemId;

    @NotNull
    private Long lotId;

    @NotNull @Positive
    private Double quantity;

    @NotNull @Positive
    private Double pricePerUnit;
}
