package com.example.agri_backend.service;

import com.example.agri_backend.dto.ProduceLotDTO;
import com.example.agri_backend.entity.Farmer;
import com.example.agri_backend.entity.ProduceLot;
import com.example.agri_backend.repository.FarmerRepository;
import com.example.agri_backend.repository.ProduceLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProduceLotService {

    private final ProduceLotRepository produceLotRepository;
    private final FarmerRepository farmerRepository;

    public ProduceLotDTO create(ProduceLotDTO dto) {
        Farmer farmer = farmerRepository.findById(dto.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Farmer not found: " + dto.getFarmerId()));
        ProduceLot lot = ProduceLot.builder()
                .farmer(farmer)
                .cropType(dto.getCropType())
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .harvestDate(dto.getHarvestDate())
                .qualityGrade(dto.getQualityGrade())
                .availableQuantity(dto.getQuantity())
                .imageUrl(dto.getImageUrl())
                .build();
        return toDTO(produceLotRepository.save(lot));
    }

    public List<ProduceLotDTO> getAll() {
        return produceLotRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<ProduceLotDTO> getByFarmer(Long farmerId) {
        return produceLotRepository.findByFarmer_FarmerId(farmerId).stream().map(this::toDTO).toList();
    }

    public ProduceLotDTO getById(Long id) {
        return toDTO(produceLotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProduceLot not found: " + id)));
    }

    private ProduceLotDTO toDTO(ProduceLot l) {
        ProduceLotDTO dto = new ProduceLotDTO();
        dto.setLotId(l.getLotId());
        dto.setFarmerId(l.getFarmer().getFarmerId());
        dto.setCropType(l.getCropType());
        dto.setQuantity(l.getQuantity());
        dto.setUnit(l.getUnit());
        dto.setHarvestDate(l.getHarvestDate());
        dto.setQualityGrade(l.getQualityGrade());
        dto.setAvailableQuantity(l.getAvailableQuantity());
        dto.setImageUrl(l.getImageUrl());
        return dto;
    }
}
