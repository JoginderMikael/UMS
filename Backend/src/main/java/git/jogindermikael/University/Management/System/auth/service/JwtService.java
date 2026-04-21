package git.jogindermikael.University.Management.System.auth.service;

import git.jogindermikael.University.Management.System.auth.security.UserPrincipal;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Calendar;
import java.util.Date;

import static io.jsonwebtoken.Jwts.*;

@Service
public class JwtService {
    private static final long EXPIRATION_MS = 864_000_000;
    private static final Key KEY =
            Keys.hmacShaKeyFor("THIS_IS_A_VERY_SECURE_SECRET_KEY_256BIT".getBytes());

    public String generateToken(UserPrincipal user){
        return builder()
                .subject(user.getUsername())
                .claim("userId", user.getId().toString())
                .claim("role", user.getAuthorities().iterator().next().getAuthority())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(KEY)
                .compact();
    }

    public String extractEmail(String token){
        //return parse(token).getBody().getSubject(); --deprecated
        return parse(token).getPayload().getSubject();
    }

    public boolean isTokenValid(String token){
        try{
            parse(token);
            return true;
        }catch (JwtException | IllegalArgumentException e){
            return false;
        }
    }

    private Jws<Claims> parse(String token){
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) KEY)
                .build()
                .parseSignedClaims(token);
    }

    public Calendar extractExpiration(String token) {
        Date expiration = parse(token).getPayload().getExpiration();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(expiration);
        return calendar;
    }
}
