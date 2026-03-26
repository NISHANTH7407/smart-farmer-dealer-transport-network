package com.example.agri_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "party")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Party {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long partyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartyType type;

    public enum PartyType { FARMER, DEALER }
}
