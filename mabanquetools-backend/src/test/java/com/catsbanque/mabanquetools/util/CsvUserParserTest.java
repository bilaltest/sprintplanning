package com.catsbanque.mabanquetools.util;

import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CsvUserParserTest {

    @Test
    void parseUsersFromCsv_shouldNormalizeEmailToLowercase() {
        // Given
        String csvPath = "data/test-users.csv";

        // When
        List<CsvUserParser.UserCsvRow> users = CsvUserParser.parseUsersFromCsv(csvPath);

        // Then
        assertNotNull(users);
        assertFalse(users.isEmpty());
        assertEquals("upper.case@ca-ts.fr", users.get(0).getEmail());
    }
}
