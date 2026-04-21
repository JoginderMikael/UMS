package git.jogindermikael.University.Management.System.academicYear.repository;

import git.jogindermikael.University.Management.System.academicYear.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicYearRepository  extends JpaRepository<AcademicYear, UUID> {
    Optional<AcademicYear> findByActiveTrue();
    List<AcademicYear> findAllByActiveTrue();
    boolean existsByName(String name);
}
