package git.jogindermikael.University.Management.System.enrollment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrationNumberService {

    private static final String STUDENT_SERIAL_SEQUENCE = "student_serial_seq";

    private final JdbcTemplate jdbcTemplate;

    public long nextSerial(){
        ensureStudentSerialSequence();
        return jdbcTemplate.queryForObject(
                "SELECT nextval('" + STUDENT_SERIAL_SEQUENCE + "')",
                Long.class
        );
    }
    public String generateRegistrationNumber(
            String schoolCode,
            String programCode,
            Long serial,
            int year
    )
    {
        return String.format(
                "%s/%s/%05d/%d",
                schoolCode.toUpperCase(),
                programCode.toUpperCase(),
                serial,
                year
        );
    }

    private void ensureStudentSerialSequence() {
        Boolean sequenceExists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_class
                    WHERE relkind = 'S'
                      AND relname = ?
                )
                """,
                Boolean.class,
                STUDENT_SERIAL_SEQUENCE
        );

        if (Boolean.TRUE.equals(sequenceExists)) {
            return;
        }

        jdbcTemplate.execute(
                "CREATE SEQUENCE IF NOT EXISTS " + STUDENT_SERIAL_SEQUENCE + " START WITH 1 INCREMENT BY 1"
        );

        Long nextSerial = jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(MAX(CAST(split_part(registration_number, '/', 3) AS BIGINT)), 0) + 1
                FROM students
                """,
                Long.class
        );

        jdbcTemplate.queryForObject(
                "SELECT setval('" + STUDENT_SERIAL_SEQUENCE + "', ?, false)",
                Long.class,
                nextSerial == null ? 1L : nextSerial
        );
    }
}
