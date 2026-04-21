package git.jogindermikael.University.Management.System.enrollment.dtos;

import git.jogindermikael.University.Management.System.enrollment.entity.EnrollmentStatus;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentResponse(
        UUID enrollmentId,
        UUID studentId,
        String studentName,
        String registrationNumber,
        String studentEmail,
        String program,
        String school,
        int enrollmentYear,
        EnrollmentStatus status,
        Instant cancelledAt,
        String cancellationReason
) {
}
