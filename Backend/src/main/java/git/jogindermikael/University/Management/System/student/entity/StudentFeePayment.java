package git.jogindermikael.University.Management.System.student.entity;

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
        name = "student_fee_payments",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"student_id", "semester_id"}
        )
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentFeePayment extends BaseEntity {

    @ManyToOne(optional = false)
    private Student student;

    @ManyToOne(optional = false)
    private Semester semester;

    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    private boolean cleared;

}
