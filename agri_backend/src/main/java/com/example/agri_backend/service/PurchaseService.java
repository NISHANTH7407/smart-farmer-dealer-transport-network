package com.example.agri_backend.service;

import com.example.agri_backend.dto.PurchaseDTO;
import com.example.agri_backend.dto.PurchaseItemDTO;
import com.example.agri_backend.entity.*;
import com.example.agri_backend.entity.Purchase.PurchaseStatus;
import com.example.agri_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final DealerRepository dealerRepository;
    private final ProduceLotRepository produceLotRepository;

    @Transactional
    public PurchaseDTO create(PurchaseDTO dto) {
        Dealer dealer = dealerRepository.findById(dto.getDealerId())
                .orElseThrow(() -> new RuntimeException("Dealer not found: " + dto.getDealerId()));

        Purchase purchase = Purchase.builder()
                .dealer(dealer)
                .purchaseDate(LocalDate.now())
                .status(PurchaseStatus.PENDING)
                .build();

        List<PurchaseItem> items = dto.getItems().stream().map(itemDTO -> {
            ProduceLot lot = produceLotRepository.findById(itemDTO.getLotId())
                    .orElseThrow(() -> new RuntimeException("Lot not found: " + itemDTO.getLotId()));

            if (lot.getAvailableQuantity() < itemDTO.getQuantity())
                throw new RuntimeException("Insufficient quantity for lot: " + lot.getLotId());

            lot.setAvailableQuantity(lot.getAvailableQuantity() - itemDTO.getQuantity());
            produceLotRepository.save(lot);

            return PurchaseItem.builder()
                    .purchase(purchase)
                    .lot(lot)
                    .quantity(itemDTO.getQuantity())
                    .pricePerUnit(itemDTO.getPricePerUnit())
                    .build();
        }).toList();

        purchase.setItems(items);
        return toDTO(purchaseRepository.save(purchase));
    }

    public List<PurchaseDTO> getAll() {
        return purchaseRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<PurchaseDTO> getByDealer(Long dealerId) {
        return purchaseRepository.findByDealer_DealerId(dealerId).stream().map(this::toDTO).toList();
    }

    public PurchaseDTO getById(Long id) {
        return toDTO(purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found: " + id)));
    }

    @Transactional
    public PurchaseDTO updateStatus(Long id, PurchaseStatus status) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase not found: " + id));
        purchase.setStatus(status);
        return toDTO(purchaseRepository.save(purchase));
    }

    private PurchaseDTO toDTO(Purchase p) {
        PurchaseDTO dto = new PurchaseDTO();
        dto.setPurchaseId(p.getPurchaseId());
        dto.setDealerId(p.getDealer().getDealerId());
        dto.setPurchaseDate(p.getPurchaseDate());
        dto.setStatus(p.getStatus());
        if (p.getItems() != null) {
            dto.setItems(p.getItems().stream().map(i -> {
                PurchaseItemDTO itemDTO = new PurchaseItemDTO();
                itemDTO.setPurchaseItemId(i.getPurchaseItemId());
                itemDTO.setLotId(i.getLot().getLotId());
                itemDTO.setQuantity(i.getQuantity());
                itemDTO.setPricePerUnit(i.getPricePerUnit());
                return itemDTO;
            }).toList());
        }
        return dto;
    }
}
