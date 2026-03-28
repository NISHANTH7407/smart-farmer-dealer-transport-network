package com.example.agri_backend.service;

import com.example.agri_backend.dto.PaymentDTO;
import com.example.agri_backend.entity.*;
import com.example.agri_backend.entity.Payment.PaymentStatus;
import com.example.agri_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PurchaseRepository purchaseRepository;

    public PaymentDTO create(PaymentDTO dto) {
        Purchase purchase = purchaseRepository.findById(dto.getPurchaseId())
                .orElseThrow(() -> new RuntimeException("Purchase not found: " + dto.getPurchaseId()));

        Payment payment = Payment.builder()
                .purchase(purchase)
                .amount(dto.getAmount())
                .paymentDate(LocalDate.now())
                .status(PaymentStatus.PAID)
                .build();
        return toDTO(paymentRepository.save(payment));
    }

    public List<PaymentDTO> getAll() {
        return paymentRepository.findAll().stream().map(this::toDTO).toList();
    }

    public PaymentDTO getById(Long id) {
        return toDTO(paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id)));
    }

    private PaymentDTO toDTO(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(p.getPaymentId());
        dto.setPurchaseId(p.getPurchase().getPurchaseId());
        dto.setAmount(p.getAmount());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setStatus(p.getStatus());
        return dto;
    }
}
