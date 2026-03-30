package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "produce_lot")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProduceLot {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lotId;

    @ManyToOne
    @JoinColumn(name = "farmerId", nullable = false)
    private Farmer farmer;

    @Column(nullable = false)
    private String cropType;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private String unit;

    private LocalDate harvestDate;

    private String qualityGrade;

    @Column(nullable = false)
    private Double availableQuantity;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;
}
