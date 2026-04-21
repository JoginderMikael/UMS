package git.jogindermikael.University.Management.System.user.dto;

import git.jogindermikael.University.Management.System.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;


    // Optional student info
    private UUID studentId;
    private UUID programId;
    private String registrationNumber;
    private String schoolName;
    private String programName;
    private String nationalId;
    private String secondarySchool;
    private String secondaryPerformance;
    private int academicYear;
    private int yearOfStudy;
    private int semester;
}
