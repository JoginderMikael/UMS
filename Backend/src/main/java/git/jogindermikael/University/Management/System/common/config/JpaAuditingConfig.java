package git.jogindermikael.University.Management.System.common.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
/*
This ensures @CreatedDate and @LastModifiedDate work.
 */
}
