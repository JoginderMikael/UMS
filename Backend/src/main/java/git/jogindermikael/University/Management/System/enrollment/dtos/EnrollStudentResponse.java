package git.jogindermikael.University.Management.System.enrollment.dtos;


import java.util.UUID;

public record EnrollStudentResponse(
        UUID studentId,
        String registrationNumber,
        String name,
        String email,
        String temporaryPassword,
        String program,
        String school
) {
    //temporary password is supposed to be implemented in email service so that the student can get it
}
