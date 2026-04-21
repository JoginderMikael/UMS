package git.jogindermikael.University.Management.System.auth.service;

import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import git.jogindermikael.University.Management.System.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(@NonNull String email)
            throws UsernameNotFoundException {
        log.info("User email : {}", email);
            return userRepository.findByEmail(email)
                    .map(UserPrincipal::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    }
}
