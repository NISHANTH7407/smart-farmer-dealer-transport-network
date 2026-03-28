package com.example.agri_backend.controller;

import com.example.agri_backend.dto.TransporterDTO;
import com.example.agri_backend.service.TransporterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transporters")
@RequiredArgsConstructor
public class TransporterController {

    private final TransporterService transporterService;

    @PostMapping
    public ResponseEntity<TransporterDTO> create(@Valid @RequestBody TransporterDTO dto) {
        return ResponseEntity.ok(transporterService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<TransporterDTO>> getAll() {
        return ResponseEntity.ok(transporterService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransporterDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transporterService.getById(id));
    }
}
