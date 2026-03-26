package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "farmer")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Farmer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long farmerId;

    @OneToOne
    @JoinColumn(name = "partyId", nullable = false, unique = true)
    private Party party;
}
