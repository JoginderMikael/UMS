package git.jogindermikael.University.Management.System.enrollment.dtos;

import git.jogindermikael.University.Management.System.enrollment.entity.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateEnrollmentStatusRequest(
        @NotNull(message = "Enrollment status is required")
        EnrollmentStatus status
) {
}
