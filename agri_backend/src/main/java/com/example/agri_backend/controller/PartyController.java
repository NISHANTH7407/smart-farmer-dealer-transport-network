package com.example.agri_backend.controller;

import com.example.agri_backend.dto.PartyDTO;
import com.example.agri_backend.service.PartyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    @PostMapping
    public ResponseEntity<PartyDTO> create(@Valid @RequestBody PartyDTO dto) {
        return ResponseEntity.ok(partyService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<PartyDTO>> getAll() {
        return ResponseEntity.ok(partyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartyDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(partyService.getById(id));
    }
}
