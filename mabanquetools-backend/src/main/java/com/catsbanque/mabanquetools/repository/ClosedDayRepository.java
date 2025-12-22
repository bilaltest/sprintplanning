package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.ClosedDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClosedDayRepository extends JpaRepository<ClosedDay, String> {
    List<ClosedDay> findAllByOrderByDateAsc();
}
