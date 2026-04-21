package git.jogindermikael.University.Management.System.semester.entity;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "semesters",
uniqueConstraints = {
        @UniqueConstraint(columnNames = {"academic_year_id", "number"})
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Semester extends BaseEntity {

    @Column(nullable = false)
    private int number;

    @Column(nullable = false)
    String name;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(nullable = false)
    private boolean active;
}
