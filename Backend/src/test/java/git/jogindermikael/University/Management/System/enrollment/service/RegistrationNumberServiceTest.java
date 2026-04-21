package git.jogindermikael.University.Management.System.enrollment.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationNumberServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private RegistrationNumberService registrationNumberService;

    @Test
    void nextSerial_ShouldReturnSerialFromSequence() {
        when(jdbcTemplate.queryForObject(
                "SELECT nextval('student_serial_seq')",
                Long.class
        )).thenReturn(100L);

        long result = registrationNumberService.nextSerial();

        assertEquals(100L, result);
        verify(jdbcTemplate, times(1)).queryForObject(
                "SELECT nextval('student_serial_seq')",
                Long.class
        );
    }

    @Test
    void nextSerial_ShouldReturnIncrementingValues() {
        when(jdbcTemplate.queryForObject(
                "SELECT nextval('student_serial_seq')",
                Long.class
        )).thenReturn(1L, 2L, 3L);

        long first = registrationNumberService.nextSerial();
        long second = registrationNumberService.nextSerial();
        long third = registrationNumberService.nextSerial();

        assertEquals(1L, first);
        assertEquals(2L, second);
        assertEquals(3L, third);
        verify(jdbcTemplate, times(3)).queryForObject(
                "SELECT nextval('student_serial_seq')",
                Long.class
        );
    }

    @Test
    void generateRegistrationNumber_ShouldGenerateCorrectFormat() {
        String result = registrationNumberService.generateRegistrationNumber(
                "eng",
                "cs",
                5L,
                2026
        );

        assertEquals("ENG/CS/00005/2026", result);
    }

    @Test
    void generateRegistrationNumber_ShouldConvertToUpperCase() {
        String result = registrationNumberService.generateRegistrationNumber(
                "sci",
                "bio",
                1L,
                2024
        );

        assertEquals("SCI/BIO/00001/2024", result);
    }

    @Test
    void generateRegistrationNumber_ShouldPadSerialWithZeros() {
        String result = registrationNumberService.generateRegistrationNumber(
                "ENG",
                "MECH",
                99999L,
                2026
        );

        assertEquals("ENG/MECH/99999/2026", result);
    }

    @Test
    void generateRegistrationNumber_ShouldHandleSingleDigitSerial() {
        String result = registrationNumberService.generateRegistrationNumber(
                "LAW",
                "LLB",
                1L,
                2025
        );

        assertEquals("LAW/LLB/00001/2025", result);
    }

    @Test
    void generateRegistrationNumber_ShouldHandleLargeYear() {
        String result = registrationNumberService.generateRegistrationNumber(
                "MED",
                "MD",
                500L,
                2100
        );

        assertEquals("MED/MD/00500/2100", result);
    }

    @Test
    void generateRegistrationNumber_ShouldBeNotNull() {
        String result = registrationNumberService.generateRegistrationNumber(
                "eng",
                "cs",
                1L,
                2026
        );

        assertNotNull(result);
    }

    @Test
    void generateRegistrationNumber_ShouldContainAllComponents() {
        String result = registrationNumberService.generateRegistrationNumber(
                "eng",
                "cs",
                12345L,
                2026
        );

        String[] parts = result.split("/");
        assertEquals(4, parts.length);
        assertEquals("ENG", parts[0]);
        assertEquals("CS", parts[1]);
        assertEquals("12345", parts[2]);
        assertEquals("2026", parts[3]);
    }

    @Test
    void nextSerial_ShouldReturnLargeSerialNumbers() {
        when(jdbcTemplate.queryForObject(
                "SELECT nextval('student_serial_seq')",
                Long.class
        )).thenReturn(999999L);

        long result = registrationNumberService.nextSerial();

        assertEquals(999999L, result);
    }

    @Test
    void generateRegistrationNumber_WithLargeSerial_ShouldFormatCorrectly() {
        // Testing the behavior when serial exceeds 5 digits
        String result = registrationNumberService.generateRegistrationNumber(
                "ENG",
                "CS",
                123456L,  // 6 digits
                2026
        );

        // The format %05d will display all digits (no truncation), just with minimum 5 digits
        assertEquals("ENG/CS/123456/2026", result);
    }
}
