package com.example.agri_backend.service;

import com.example.agri_backend.dto.DealerDTO;
import com.example.agri_backend.entity.Dealer;
import com.example.agri_backend.entity.Party;
import com.example.agri_backend.repository.DealerRepository;
import com.example.agri_backend.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DealerService {

    private final DealerRepository dealerRepository;
    private final PartyRepository partyRepository;

    public DealerDTO create(DealerDTO dto) {
        Party party = partyRepository.findById(dto.getPartyId())
                .orElseThrow(() -> new RuntimeException("Party not found: " + dto.getPartyId()));
        Dealer saved = dealerRepository.save(Dealer.builder().party(party).build());
        return toDTO(saved);
    }

    public List<DealerDTO> getAll() {
        return dealerRepository.findAll().stream().map(this::toDTO).toList();
    }

    public DealerDTO getById(Long id) {
        return toDTO(dealerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dealer not found: " + id)));
    }

    private DealerDTO toDTO(Dealer d) {
        DealerDTO dto = new DealerDTO();
        dto.setDealerId(d.getDealerId());
        dto.setPartyId(d.getParty().getPartyId());
        dto.setName(d.getParty().getName());
        dto.setPhone(d.getParty().getPhone());
        dto.setAddress(d.getParty().getAddress());
        return dto;
    }
}
