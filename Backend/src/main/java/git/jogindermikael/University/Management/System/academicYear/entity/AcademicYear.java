package git.jogindermikael.University.Management.System.academicYear.entity;

import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "academic_years")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class AcademicYear extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active;


    @OneToMany(
            mappedBy = "academicYear",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Semester> semesters = new ArrayList<>();
}
