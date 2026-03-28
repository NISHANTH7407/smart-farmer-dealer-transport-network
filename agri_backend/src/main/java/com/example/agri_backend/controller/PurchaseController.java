package com.example.agri_backend.controller;

import com.example.agri_backend.dto.PurchaseDTO;
import com.example.agri_backend.entity.Purchase.PurchaseStatus;
import com.example.agri_backend.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<PurchaseDTO> create(@Valid @RequestBody PurchaseDTO dto) {
        return ResponseEntity.ok(purchaseService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseDTO>> getAll() {
        return ResponseEntity.ok(purchaseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseDTO> updateStatus(@PathVariable Long id, @RequestParam PurchaseStatus status) {
        return ResponseEntity.ok(purchaseService.updateStatus(id, status));
    }
}
