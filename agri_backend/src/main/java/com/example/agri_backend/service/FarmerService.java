package com.example.agri_backend.service;

import com.example.agri_backend.dto.FarmerDTO;
import com.example.agri_backend.entity.Farmer;
import com.example.agri_backend.entity.Party;
import com.example.agri_backend.repository.FarmerRepository;
import com.example.agri_backend.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;
    private final PartyRepository partyRepository;

    public FarmerDTO create(FarmerDTO dto) {
        Party party = partyRepository.findById(dto.getPartyId())
                .orElseThrow(() -> new RuntimeException("Party not found: " + dto.getPartyId()));
        Farmer saved = farmerRepository.save(Farmer.builder().party(party).build());
        return toDTO(saved);
    }

    public List<FarmerDTO> getAll() {
        return farmerRepository.findAll().stream().map(this::toDTO).toList();
    }

    public FarmerDTO getById(Long id) {
        return toDTO(farmerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farmer not found: " + id)));
    }

    private FarmerDTO toDTO(Farmer f) {
        FarmerDTO dto = new FarmerDTO();
        dto.setFarmerId(f.getFarmerId());
        dto.setPartyId(f.getParty().getPartyId());
        dto.setName(f.getParty().getName());
        dto.setPhone(f.getParty().getPhone());
        dto.setAddress(f.getParty().getAddress());
        return dto;
    }
}
