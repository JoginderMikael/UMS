package git.jogindermikael.University.Management.System.common.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;


/*
@MappedSuperclass → Not a table itself, fields inherited

UUID → PostgreSQL-compatible

Instant → UTC-safe timestamps

AuditingEntityListener → automatically sets timestamps

Once you create any entity extending BaseEntity:

eg

@Entity
@Table(name = "users")
public class User extends BaseEntity {
    // name, email, password, role etc.
}


On insert → id, createdAt, updatedAt auto-filled

On update → updatedAt auto-updated
 */


@Getter
@Setter
@ToString
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity {

    @Id
    @GeneratedValue
    @Column(updatable = false, nullable = false, unique = true, length = 36)
    private UUID id;


    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
