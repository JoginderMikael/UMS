package git.jogindermikael.University.Management.System.academic.school.department.repository;

import git.jogindermikael.University.Management.System.academic.school.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);

    @Query(value = "SELECT * FROM departments WHERE id = :id AND school_id = :schoolId AND active = false" , nativeQuery = true)
    Optional<Department> findIncludingDeleted(@Param("id") UUID id, @Param("schoolId") UUID schoolId);

    @Query(value = "SELECT * FROM departments WHERE active = false AND school_id = :schoolId",  nativeQuery = true)
    List<Department> findAllDeleted(@Param("schoolId") UUID schoolId);

    Optional<Department> findByIdAndSchoolId(UUID id, UUID schoolId);

    List<Department> findAllBySchoolId(UUID schoolId);
}
