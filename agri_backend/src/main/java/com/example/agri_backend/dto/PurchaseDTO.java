package com.example.agri_backend.dto;

import com.example.agri_backend.entity.Purchase.PurchaseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseDTO {
    private Long purchaseId;

    @NotNull
    private Long dealerId;

    private LocalDate purchaseDate;
    private PurchaseStatus status;

    @NotNull
    private List<PurchaseItemDTO> items;
}
