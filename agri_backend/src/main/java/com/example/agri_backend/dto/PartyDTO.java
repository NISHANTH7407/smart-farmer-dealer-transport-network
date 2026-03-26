package com.example.agri_backend.dto;

import com.example.agri_backend.entity.Party.PartyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PartyDTO {
    private Long partyId;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    private String address;

    @NotNull
    private PartyType type;
}
