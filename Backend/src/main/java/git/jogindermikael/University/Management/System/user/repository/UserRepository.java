package git.jogindermikael.University.Management.System.user.repository;

import git.jogindermikael.University.Management.System.user.dto.UserResponse;
import git.jogindermikael.University.Management.System.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    long count();

    @Query(value = "SELECT * FROM users WHERE id = :id AND active = false", nativeQuery = true)
    Optional<User> findIncludingDeleted(@Param("id") UUID id);

    @Query(value = "SELECT * FROM users WHERE active = false",  nativeQuery = true)
    List<User> findAllDeleted();
}
