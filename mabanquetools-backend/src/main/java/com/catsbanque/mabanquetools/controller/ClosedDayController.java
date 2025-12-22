package com.catsbanque.mabanquetools.controller;

import com.catsbanque.mabanquetools.entity.ClosedDay;
import com.catsbanque.mabanquetools.service.ClosedDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/closed-days")
@RequiredArgsConstructor
public class ClosedDayController {

    private final ClosedDayService closedDayService;

    @GetMapping
    public List<ClosedDay> getAllClosedDays() {
        return closedDayService.getAllClosedDays();
    }

    @PostMapping
    public ClosedDay createClosedDay(@RequestBody ClosedDay closedDay) {
        return closedDayService.createClosedDay(closedDay);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClosedDay(@PathVariable String id) {
        closedDayService.deleteClosedDay(id);
        return ResponseEntity.noContent().build();
    }
}
