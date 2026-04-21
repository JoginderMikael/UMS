package git.jogindermikael.University.Management.System.program.repository;

import git.jogindermikael.University.Management.System.program.entity.ProgramCourse;
import git.jogindermikael.University.Management.System.program.entity.ProgramCourseId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramCourseRepository extends JpaRepository<ProgramCourse, ProgramCourseId> {
    Optional<ProgramCourse> findByProgram_IdAndCourse_Id(UUID programId, UUID courseId);
    List<ProgramCourse> findAllByProgram_Id(UUID programId);
}
