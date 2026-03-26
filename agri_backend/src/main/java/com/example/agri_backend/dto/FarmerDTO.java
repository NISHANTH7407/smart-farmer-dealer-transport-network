package com.example.agri_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FarmerDTO {
    private Long farmerId;

    @NotNull
    private Long partyId;

    private String name;
    private String phone;
    private String address;
}
