package com.example.agri_backend.repository;

import com.example.agri_backend.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByDealer_DealerId(Long dealerId);
}
