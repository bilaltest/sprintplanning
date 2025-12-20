package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, String> {
    List<Sprint> findAllByOrderByStartDateDesc();
}
