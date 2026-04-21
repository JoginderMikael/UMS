package git.jogindermikael.University.Management.System.config;

import git.jogindermikael.University.Management.System.user.entity.Role;
import git.jogindermikael.University.Management.System.user.entity.User;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("No users found in the database. Creating default admin user...");
            
            User admin = User.builder()
                    .firstName("Super")
                    .lastName("Administrator")
                    .email("super@admin.uni")
                    .password(passwordEncoder.encode("SuperAdmin@Uni"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            
            userRepository.save(admin);
            log.info("Default admin user created successfully. email: {}, password: {}", admin.getEmail(), "SuperAdmin@Uni");
        } else {
            log.info("Users already exist in the database. Skipping default admin creation.");
        }
    }
}
