package com.catsbanque.mabanquetools.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.catsbanque.mabanquetools.util.Cuid;

@Entity
@Table(name = "closed_day")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClosedDay {

    @Id
    @Cuid
    @Column(length = 25)
    private String id;

    @Column(nullable = false, length = 10, unique = true)
    private String date; // YYYY-MM-DD

    @Column(nullable = false, length = 255)
    private String reason;
}
