package git.jogindermikael.University.Management.System.course.repository;

import git.jogindermikael.University.Management.System.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findAllBySchoolId(UUID schoolId);
    List<Course> findAllByDepartmentId(UUID departmentId);

    @Query("SELECT pc.course FROM ProgramCourse pc WHERE pc.program.id = :programId")
    List<Course> findAllByProgramId(@Param("programId") UUID programId);
}
