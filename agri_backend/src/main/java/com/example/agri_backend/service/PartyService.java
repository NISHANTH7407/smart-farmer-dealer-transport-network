package com.example.agri_backend.service;

import com.example.agri_backend.dto.PartyDTO;
import com.example.agri_backend.entity.Party;
import com.example.agri_backend.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository partyRepository;

    public PartyDTO create(PartyDTO dto) {
        Party party = Party.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .type(dto.getType())
                .build();
        return toDTO(partyRepository.save(party));
    }

    public List<PartyDTO> getAll() {
        return partyRepository.findAll().stream().map(this::toDTO).toList();
    }

    public PartyDTO getById(Long id) {
        return toDTO(partyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Party not found: " + id)));
    }

    private PartyDTO toDTO(Party p) {
        PartyDTO dto = new PartyDTO();
        dto.setPartyId(p.getPartyId());
        dto.setName(p.getName());
        dto.setPhone(p.getPhone());
        dto.setAddress(p.getAddress());
        dto.setType(p.getType());
        return dto;
    }
}
