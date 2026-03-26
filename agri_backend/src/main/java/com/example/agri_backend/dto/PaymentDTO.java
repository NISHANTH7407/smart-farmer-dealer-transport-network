package com.example.agri_backend.dto;

import com.example.agri_backend.entity.Payment.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PaymentDTO {
    private Long paymentId;

    @NotNull
    private Long purchaseId;

    @NotNull @Positive
    private Double amount;

    private LocalDate paymentDate;
    private PaymentStatus status;
}
