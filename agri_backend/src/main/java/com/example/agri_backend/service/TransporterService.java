package com.example.agri_backend.service;

import com.example.agri_backend.dto.TransporterDTO;
import com.example.agri_backend.entity.Transporter;
import com.example.agri_backend.repository.TransporterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransporterService {

    private final TransporterRepository transporterRepository;

    public TransporterDTO create(TransporterDTO dto) {
        Transporter t = Transporter.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .vehicleDetails(dto.getVehicleDetails())
                .ratePerKm(dto.getRatePerKm() != null ? dto.getRatePerKm() : 10.0)
                .build();
        return toDTO(transporterRepository.save(t));
    }

    public List<TransporterDTO> getAll() {
        return transporterRepository.findAll().stream().map(this::toDTO).toList();
    }

    public TransporterDTO getById(Long id) {
        return toDTO(transporterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transporter not found: " + id)));
    }

    private TransporterDTO toDTO(Transporter t) {
        TransporterDTO dto = new TransporterDTO();
        dto.setTransporterId(t.getTransporterId());
        dto.setName(t.getName());
        dto.setPhone(t.getPhone());
        dto.setVehicleDetails(t.getVehicleDetails());
        dto.setRatePerKm(t.getRatePerKm());
        return dto;
    }
}
