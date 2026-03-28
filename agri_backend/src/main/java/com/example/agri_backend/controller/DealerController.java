package com.example.agri_backend.controller;

import com.example.agri_backend.dto.DealerDTO;
import com.example.agri_backend.dto.PurchaseDTO;
import com.example.agri_backend.service.DealerService;
import com.example.agri_backend.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dealers")
@RequiredArgsConstructor
public class DealerController {

    private final DealerService dealerService;
    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<DealerDTO> create(@Valid @RequestBody DealerDTO dto) {
        return ResponseEntity.ok(dealerService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<DealerDTO>> getAll() {
        return ResponseEntity.ok(dealerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DealerDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dealerService.getById(id));
    }

    @GetMapping("/{id}/purchases")
    public ResponseEntity<List<PurchaseDTO>> getPurchases(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getByDealer(id));
    }
}
