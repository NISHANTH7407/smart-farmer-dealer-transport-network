package com.example.agri_backend.controller;

import com.example.agri_backend.dto.FarmerDTO;
import com.example.agri_backend.dto.ProduceLotDTO;
import com.example.agri_backend.service.FarmerService;
import com.example.agri_backend.service.ProduceLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class FarmerController {

    private final FarmerService farmerService;
    private final ProduceLotService produceLotService;

    @PostMapping
    public ResponseEntity<FarmerDTO> create(@Valid @RequestBody FarmerDTO dto) {
        return ResponseEntity.ok(farmerService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<FarmerDTO>> getAll() {
        return ResponseEntity.ok(farmerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmerDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(farmerService.getById(id));
    }

    @PostMapping("/{id}/lots")
    public ResponseEntity<ProduceLotDTO> addLot(@PathVariable Long id, @RequestBody ProduceLotDTO dto) {
        dto.setFarmerId(id);
        return ResponseEntity.ok(produceLotService.create(dto));
    }

    @GetMapping("/{id}/lots")
    public ResponseEntity<List<ProduceLotDTO>> getLots(@PathVariable Long id) {
        return ResponseEntity.ok(produceLotService.getByFarmer(id));
    }
}
