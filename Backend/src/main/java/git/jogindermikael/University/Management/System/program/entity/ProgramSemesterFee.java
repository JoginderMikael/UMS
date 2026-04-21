package git.jogindermikael.University.Management.System.program.entity;

import git.jogindermikael.University.Management.System.common.entity.BaseEntity;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "program_semester_fees",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"program_id", "semester_id"}
                )
        }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProgramSemesterFee extends BaseEntity {

    @ManyToOne(optional = false)
    private Program program;

    @ManyToOne(optional = false)
    private Semester semester;

    private BigDecimal amount;

}
