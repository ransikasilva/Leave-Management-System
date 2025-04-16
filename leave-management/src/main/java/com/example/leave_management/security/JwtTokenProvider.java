package com.example.leave_management.security;

import com.example.leave_management.exception.ResourceNotFoundException;
import com.example.leave_management.repository.UserRepository;
import com.example.leave_management.util.Constants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    // Create a secure key from the token secret
    private final javax.crypto.SecretKey jwtSecretKey = Keys.hmacShaKeyFor(
            Constants.TOKEN_SECRET.getBytes(StandardCharsets.UTF_8)
    );

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + Constants.ACCESS_TOKEN_VALIDITY);

        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("authorities", authorities)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + Constants.REFRESH_TOKEN_VALIDITY);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public String generateTokenFromUserId(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + Constants.ACCESS_TOKEN_VALIDITY);

        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public String generateRefreshTokenFromUserId(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + Constants.REFRESH_TOKEN_VALIDITY);

        return Jwts.builder()
                .setSubject(userId)
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public String getUserIdFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getSubject();
    }

    public String getUserIdFromRefreshToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        if (!"refresh".equals(claims.get("type"))) {
            throw new IllegalArgumentException("Not a refresh token");
        }
        return claims.getSubject();
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (SignatureException ex) {
            // Invalid JWT signature
        } catch (MalformedJwtException ex) {
            // Invalid JWT token
        } catch (ExpiredJwtException ex) {
            // Expired JWT token
        } catch (UnsupportedJwtException ex) {
            // Unsupported JWT token
        } catch (IllegalArgumentException ex) {
            // JWT claims string is empty
        }
        return false;
    }

    public Boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return !isTokenExpired(token) && "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    public UsernamePasswordAuthenticationToken getAuthenticationToken(String token, Authentication existingAuth, UserDetails userDetails) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get("authorities").toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);
    }

    @Service
    public static class UserDetailsServiceImpl implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        @Transactional
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            com.example.leave_management.model.User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

            return createUserDetails(user);
        }

        @Transactional
        public UserDetails loadUserById(String id) {
            com.example.leave_management.model.User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

            return createUserDetails(user);
        }

        private UserDetails createUserDetails(com.example.leave_management.model.User user) {
            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> {
                        // Ensure each role has the ROLE_ prefix
                        String formattedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                        return new SimpleGrantedAuthority(formattedRole);
                    })
                    .collect(Collectors.toList());

            return new User(
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
}