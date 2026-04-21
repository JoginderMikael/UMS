package git.jogindermikael.University.Management.System.student.entity;

import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import git.jogindermikael.University.Management.System.course.entity.Course;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "student_course_results",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"student_id", "course_id", "semester_id"}
                )
        }
)
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCourseResult extends BaseEntity {

    @ManyToOne(optional = false)
    private Student student;

    @ManyToOne(optional = false)
    private Course course;

    @ManyToOne(optional = false)
    private Semester semester;

    private Integer marks; //0 - 100
    private String grade;  //A, B, C, D, F
}
