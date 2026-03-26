package com.example.agri_backend.repository;

import com.example.agri_backend.entity.ProduceLot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProduceLotRepository extends JpaRepository<ProduceLot, Long> {
    List<ProduceLot> findByFarmer_FarmerId(Long farmerId);
}
