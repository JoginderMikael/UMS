package git.jogindermikael.University.Management.System.academic.school.repository;

import git.jogindermikael.University.Management.System.academic.school.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SchoolRepository extends JpaRepository<School, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);

    Optional<School> findByNameIgnoreCase(String name);
    Optional<School> findByCodeIgnoreCase(String code);

    @Query(value = "SELECT * FROM schools WHERE id = :id AND active = false", nativeQuery = true)
    Optional<School> findDeleted(@Param("id") UUID id);

    @Query(value = "SELECT * FROM schools WHERE active = false", nativeQuery = true)
    List<School> findAllDeleted();
}
