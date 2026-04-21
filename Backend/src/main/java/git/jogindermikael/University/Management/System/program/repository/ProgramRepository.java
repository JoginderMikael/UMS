package git.jogindermikael.University.Management.System.program.repository;

import git.jogindermikael.University.Management.System.program.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProgramRepository extends JpaRepository<Program, UUID> {
    List<Program> findAllBySchoolId(UUID school);
    List<Program> findAllByDepartmentId(UUID departmentId);
}
