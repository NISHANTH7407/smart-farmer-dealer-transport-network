package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transporter")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Transporter {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transporterId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    private String vehicleDetails;

    @Builder.Default
    private Double ratePerKm = 10.0;
}
