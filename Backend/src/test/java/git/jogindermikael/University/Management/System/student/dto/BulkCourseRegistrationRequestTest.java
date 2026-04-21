package git.jogindermikael.University.Management.System.student.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BulkCourseRegistrationRequestTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDownValidator() {
        validatorFactory.close();
    }

    @Test
    void shouldValidate_WhenRequestIsValid() {
        BulkCourseRegistrationRequest request = new BulkCourseRegistrationRequest(
                UUID.randomUUID(),
                List.of(UUID.randomUUID())
        );

        Set<ConstraintViolation<BulkCourseRegistrationRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailValidation_WhenStudentIdIsNull() {
        BulkCourseRegistrationRequest request = new BulkCourseRegistrationRequest(
                null,
                List.of(UUID.randomUUID())
        );

        Set<ConstraintViolation<BulkCourseRegistrationRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailValidation_WhenCourseIdsIsEmpty() {
        BulkCourseRegistrationRequest request = new BulkCourseRegistrationRequest(
                UUID.randomUUID(),
                List.of()
        );

        Set<ConstraintViolation<BulkCourseRegistrationRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }
}
