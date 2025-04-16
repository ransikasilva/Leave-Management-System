    package com.example.leave_management.security;

    import com.example.leave_management.exception.ResourceNotFoundException;
    import com.example.leave_management.model.User;
    import com.example.leave_management.repository.UserRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    import java.util.List;
    import java.util.stream.Collectors;

    @Service
    public class UserDetailsServiceImpl implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        @Transactional
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

            return createUserDetails(user);
        }

        @Transactional
        public UserDetails loadUserById(String id) {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

            return createUserDetails(user);
        }

        private UserDetails createUserDetails(User user) {
            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> {
                        // Ensure each role has the ROLE_ prefix
                        String formattedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                        return new SimpleGrantedAuthority(formattedRole);
                    })
                    .collect(Collectors.toList());

            return new org.springframework.security.core.userdetails.User(
                    user.getId(),
                    user.getPassword(),
                    user.isEnabled(),
                    true, // accountNonExpired
                    true, // credentialsNonExpired
                    true, // accountNonLocked
                    authorities
            );
        }
    }