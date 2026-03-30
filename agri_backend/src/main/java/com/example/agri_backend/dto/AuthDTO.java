package com.example.agri_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
        @NotBlank
        private String name;
        @NotBlank
        private String role; // FARMER, DEALER, TRANSPORTER
        private Long entityId;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private UserInfo user;

        @Data
        public static class UserInfo {
            private Long id;
            private String username;
            private String name;
            private String role;
            private Long entityId;
        }
    }
}
