package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
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

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "purchase", fetch = FetchType.EAGER)
    @Builder.Default
    private List<PurchaseItem> items = new ArrayList<>();

    public enum PurchaseStatus { PENDING, CONFIRMED, CANCELLED }
}
