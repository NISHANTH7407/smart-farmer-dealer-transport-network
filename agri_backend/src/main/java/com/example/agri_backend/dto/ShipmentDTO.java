package com.example.agri_backend.dto;

import com.example.agri_backend.entity.Shipment.ShipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ShipmentDTO {
    private Long shipmentId;

    @NotNull
    private Long transporterId;

    @NotNull
    private Long fromPartyId;

    @NotNull
    private Long toPartyId;

    @NotBlank
    private String pickupLocation;

    @NotBlank
    private String dropLocation;

    @NotNull
    private Double distanceKm;

    private Double fee;
    private ShipmentStatus status;
    private LocalDate shipmentDate;
    private LocalDate deliveryDate;

    // Response-only fields
    private String transporterName;
    private String fromPartyName;
    private String toPartyName;
    private Double ratePerKm;
}
