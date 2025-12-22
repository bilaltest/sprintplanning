package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.ClosedDay;
import com.catsbanque.mabanquetools.repository.ClosedDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClosedDayService {

    private final ClosedDayRepository closedDayRepository;

    public List<ClosedDay> getAllClosedDays() {
        return closedDayRepository.findAllByOrderByDateAsc();
    }

    public ClosedDay createClosedDay(ClosedDay closedDay) {
        return closedDayRepository.save(closedDay);
    }

    public void deleteClosedDay(String id) {
        closedDayRepository.deleteById(id);
    }
}
