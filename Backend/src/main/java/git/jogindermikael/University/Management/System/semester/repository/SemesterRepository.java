package git.jogindermikael.University.Management.System.semester.repository;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    Optional<Semester> findByAcademicYearAndNumber(AcademicYear academicYear, int number);
    Optional<Semester> findByAcademicYearAndActiveTrue(AcademicYear academicYear);
    List<Semester> findByAcademicYear_Id(UUID academicYearId);

    Optional<Semester> findByActiveTrue();
    List<Semester> findByActiveTrueOrderByUpdatedAtDescCreatedAtDesc();
}
