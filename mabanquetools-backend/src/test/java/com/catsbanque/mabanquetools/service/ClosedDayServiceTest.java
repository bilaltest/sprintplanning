package com.catsbanque.mabanquetools.service;

import com.catsbanque.mabanquetools.entity.ClosedDay;
import com.catsbanque.mabanquetools.repository.ClosedDayRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClosedDayServiceTest {

    @Mock
    private ClosedDayRepository closedDayRepository;

    @InjectMocks
    private ClosedDayService closedDayService;

    @Test
    void getAllClosedDays() {
        ClosedDay day1 = new ClosedDay("1", "2024-01-01", "New Year");
        ClosedDay day2 = new ClosedDay("2", "2024-05-01", "Labor Day");

        when(closedDayRepository.findAllByOrderByDateAsc()).thenReturn(Arrays.asList(day1, day2));

        List<ClosedDay> result = closedDayService.getAllClosedDays();

        assertEquals(2, result.size());
        assertEquals("2024-01-01", result.get(0).getDate());
        verify(closedDayRepository, times(1)).findAllByOrderByDateAsc();
    }

    @Test
    void createClosedDay() {
        ClosedDay day = new ClosedDay(null, "2024-07-14", "National Day");
        ClosedDay savedDay = new ClosedDay("3", "2024-07-14", "National Day");

        when(closedDayRepository.save(day)).thenReturn(savedDay);

        ClosedDay result = closedDayService.createClosedDay(day);

        assertEquals("3", result.getId());
        assertEquals("National Day", result.getReason());
        verify(closedDayRepository, times(1)).save(day);
    }

    @Test
    void deleteClosedDay() {
        String id = "1";
        doNothing().when(closedDayRepository).deleteById(id);

        closedDayService.deleteClosedDay(id);

        verify(closedDayRepository, times(1)).deleteById(id);
    }
}
