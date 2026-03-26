package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "purchase_item")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseItemId;

    @ManyToOne
    @JoinColumn(name = "purchaseId", nullable = false)
    private Purchase purchase;

    @ManyToOne
    @JoinColumn(name = "lotId", nullable = false)
    private ProduceLot lot;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private Double pricePerUnit;
}
