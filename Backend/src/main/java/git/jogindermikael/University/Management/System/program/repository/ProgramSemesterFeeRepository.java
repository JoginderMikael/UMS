package git.jogindermikael.University.Management.System.program.repository;

import git.jogindermikael.University.Management.System.program.entity.Program;
import git.jogindermikael.University.Management.System.program.entity.ProgramSemesterFee;
import git.jogindermikael.University.Management.System.semester.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramSemesterFeeRepository extends JpaRepository<ProgramSemesterFee, UUID> {
    Optional<ProgramSemesterFee> findByProgramAndSemester(Program program, Semester semester);
    List<ProgramSemesterFee> findByProgram_IdOrderBySemester_AcademicYear_NameAscSemester_NumberAsc(UUID programId);
}
