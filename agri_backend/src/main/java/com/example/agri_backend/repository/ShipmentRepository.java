package com.example.agri_backend.repository;

import com.example.agri_backend.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {}
