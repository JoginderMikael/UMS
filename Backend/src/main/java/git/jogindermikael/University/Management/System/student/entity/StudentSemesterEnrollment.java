package git.jogindermikael.University.Management.System.student.entity;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "student_semester_enrollments",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"student_id", "semester_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSemesterEnrollment extends BaseEntity {

    @ManyToOne(optional = false)
    private Student student;

    @ManyToOne(optional = false)
    private AcademicYear academicYear;

    @ManyToOne(optional = false)
    private Semester semester;

    private int yearOfStudy; //can be 1 - 4
    private int semesterNumber;  //can be 1 or 2


    private boolean active; //for current semester
}
