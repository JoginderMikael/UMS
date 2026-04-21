package git.jogindermikael.University.Management.System.enrollment.dtos;

import java.util.UUID;

public record EnrollStudentRequest(
        String firstName,
        String lastName,
        String email,
        String nationalId,
        String secondarySchool,
        String secondaryPerformance,
        UUID schoolId,
        UUID programId
) {}
