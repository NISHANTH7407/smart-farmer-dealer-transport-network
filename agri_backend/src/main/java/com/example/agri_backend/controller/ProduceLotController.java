package com.example.agri_backend.controller;

import com.example.agri_backend.dto.ProduceLotDTO;
import com.example.agri_backend.service.ProduceLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lots")
@RequiredArgsConstructor
public class ProduceLotController {

    private final ProduceLotService produceLotService;

    @PostMapping
    public ResponseEntity<ProduceLotDTO> create(@Valid @RequestBody ProduceLotDTO dto) {
        return ResponseEntity.ok(produceLotService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<ProduceLotDTO>> getAll() {
        return ResponseEntity.ok(produceLotService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduceLotDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(produceLotService.getById(id));
    }
}
