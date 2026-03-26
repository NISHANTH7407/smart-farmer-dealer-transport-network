package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "shipment")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Shipment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shipmentId;

    @ManyToOne
    @JoinColumn(name = "transporterId", nullable = false)
    private Transporter transporter;

    @ManyToOne
    @JoinColumn(name = "fromPartyId", nullable = false)
    private Party fromParty;

    @ManyToOne
    @JoinColumn(name = "toPartyId", nullable = false)
    private Party toParty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status;

    private LocalDate shipmentDate;
    private LocalDate deliveryDate;

    public enum ShipmentStatus { IN_TRANSIT, DELIVERED }
}
