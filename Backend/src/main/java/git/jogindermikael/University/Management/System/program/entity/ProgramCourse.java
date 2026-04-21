package git.jogindermikael.University.Management.System.program.entity;

import git.jogindermikael.University.Management.System.course.entity.Course;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "program_course")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProgramCourse {

    @EmbeddedId
    private ProgramCourseId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("programId")
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("courseId")
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_type")
    private ProgramCourseType courseType;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;
}
