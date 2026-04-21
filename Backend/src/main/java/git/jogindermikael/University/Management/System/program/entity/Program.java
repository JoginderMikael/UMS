package git.jogindermikael.University.Management.System.program.entity;

import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import git.jogindermikael.University.Management.System.academic.school.entity.School;
import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;


@Entity
@Table(name="programs")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SQLRestriction("active = true")
public class Program extends BaseEntity {

    @Column(nullable=false)
    private String name;

    @Column(nullable=false,  unique=true)
    private String code;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProgramCourse> programCourses = new HashSet<>();

    @Column(nullable = false)
    private boolean active;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by")
    private UUID deletedBy;
}
