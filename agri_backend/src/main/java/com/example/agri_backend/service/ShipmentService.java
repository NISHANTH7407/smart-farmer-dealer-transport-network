package com.example.agri_backend.service;

import com.example.agri_backend.dto.ShipmentDTO;
import com.example.agri_backend.entity.*;
import com.example.agri_backend.entity.Shipment.ShipmentStatus;
import com.example.agri_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final TransporterRepository transporterRepository;
    private final PartyRepository partyRepository;

    public ShipmentDTO create(ShipmentDTO dto) {
        Transporter transporter = transporterRepository.findById(dto.getTransporterId())
                .orElseThrow(() -> new RuntimeException("Transporter not found: " + dto.getTransporterId()));
        Party from = partyRepository.findById(dto.getFromPartyId())
                .orElseThrow(() -> new RuntimeException("From party not found: " + dto.getFromPartyId()));
        Party to = partyRepository.findById(dto.getToPartyId())
                .orElseThrow(() -> new RuntimeException("To party not found: " + dto.getToPartyId()));

        // Calculate fee dynamically: distance * ratePerKm
        double ratePerKm = transporter.getRatePerKm() != null ? transporter.getRatePerKm() : 10.0;
        double fee = dto.getDistanceKm() * ratePerKm;

        Shipment shipment = Shipment.builder()
                .transporter(transporter)
                .fromParty(from)
                .toParty(to)
                .status(ShipmentStatus.IN_TRANSIT)
                .shipmentDate(LocalDate.now())
                .pickupLocation(dto.getPickupLocation())
                .dropLocation(dto.getDropLocation())
                .distanceKm(dto.getDistanceKm())
                .fee(fee)
                .build();

        return toDTO(shipmentRepository.save(shipment));
    }

    public List<ShipmentDTO> getAll() {
        return shipmentRepository.findAll().stream().map(this::toDTO).toList();
    }

    public ShipmentDTO getById(Long id) {
        return toDTO(shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + id)));
    }

    public ShipmentDTO updateStatus(Long id, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found: " + id));
        shipment.setStatus(status);
        if (status == ShipmentStatus.DELIVERED) shipment.setDeliveryDate(LocalDate.now());
        return toDTO(shipmentRepository.save(shipment));
    }

    private ShipmentDTO toDTO(Shipment s) {
        ShipmentDTO dto = new ShipmentDTO();
        dto.setShipmentId(s.getShipmentId());
        dto.setTransporterId(s.getTransporter().getTransporterId());
        dto.setTransporterName(s.getTransporter().getName());
        dto.setRatePerKm(s.getTransporter().getRatePerKm());
        dto.setFromPartyId(s.getFromParty().getPartyId());
        dto.setFromPartyName(s.getFromParty().getName());
        dto.setToPartyId(s.getToParty().getPartyId());
        dto.setToPartyName(s.getToParty().getName());
        dto.setStatus(s.getStatus());
        dto.setShipmentDate(s.getShipmentDate());
        dto.setDeliveryDate(s.getDeliveryDate());
        dto.setPickupLocation(s.getPickupLocation());
        dto.setDropLocation(s.getDropLocation());
        dto.setDistanceKm(s.getDistanceKm());
        dto.setFee(s.getFee());
        return dto;
    }
}
