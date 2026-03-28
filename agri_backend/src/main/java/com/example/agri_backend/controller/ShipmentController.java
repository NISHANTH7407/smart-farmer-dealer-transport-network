package com.example.agri_backend.controller;

import com.example.agri_backend.dto.ShipmentDTO;
import com.example.agri_backend.entity.Shipment.ShipmentStatus;
import com.example.agri_backend.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ShipmentDTO> create(@Valid @RequestBody ShipmentDTO dto) {
        return ResponseEntity.ok(shipmentService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<ShipmentDTO>> getAll() {
        return ResponseEntity.ok(shipmentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ShipmentDTO> updateStatus(@PathVariable Long id, @RequestParam ShipmentStatus status) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, status));
    }
}
