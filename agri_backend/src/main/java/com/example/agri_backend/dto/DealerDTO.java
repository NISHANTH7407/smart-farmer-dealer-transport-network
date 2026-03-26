package com.example.agri_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DealerDTO {
    private Long dealerId;

    @NotNull
    private Long partyId;

    private String name;
    private String phone;
    private String address;
}
