package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Purchase {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseId;

    @ManyToOne
    @JoinColumn(name = "dealerId", nullable = false)
    private Dealer dealer;

    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseStatus status;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL)
    private List<PurchaseItem> items;

    public enum PurchaseStatus { PENDING, CONFIRMED, CANCELLED }
}
