package com.example.agri_backend.repository;

import com.example.agri_backend.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {}
