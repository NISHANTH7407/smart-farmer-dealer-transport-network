package com.example.agri_backend.repository;

import com.example.agri_backend.entity.Party;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartyRepository extends JpaRepository<Party, Long> {}
