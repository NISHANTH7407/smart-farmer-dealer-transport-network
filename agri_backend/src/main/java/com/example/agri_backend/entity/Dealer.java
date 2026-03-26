package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dealer")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Dealer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dealerId;

    @OneToOne
    @JoinColumn(name = "partyId", nullable = false, unique = true)
    private Party party;
}
