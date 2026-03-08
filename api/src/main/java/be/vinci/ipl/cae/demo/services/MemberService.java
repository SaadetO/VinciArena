package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.NewMember;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling authentication and registration for members.
 */
@Service
public class MemberService {

  private static final String jwtSecret = "ilovemypizza!";
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours

  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);

  private final BCryptPasswordEncoder passwordEncoder;
  private final MemberRepository memberRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param memberRepository the member repository
   */
  public MemberService(BCryptPasswordEncoder passwordEncoder,
      MemberRepository memberRepository) {
    this.passwordEncoder = passwordEncoder;
    this.memberRepository = memberRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param email the member email included in the JWT claim
   * @return the JWT token
   */
  public AuthenticatedUser createJwtToken(String email) {

    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("username", email)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
        .sign(algorithm);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setUsername(email);
    authenticatedUser.setToken(token);

    return authenticatedUser;
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(algorithm)
          .build()
          .verify(token)
          .getClaim("username")
          .asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Login a member.
   *
   * @param email the member email
   * @param password the member password
   * @return the authenticated user if login succeeds
   */
  public AuthenticatedUser login(String email, String password) {

    Member member = memberRepository.findByEmail(email);

    if (member == null) {
      return null;
    }

    if (!passwordEncoder.matches(password, member.getPassword())) {
      return null;
    }

    return createJwtToken(email);
  }

  /**
   * Register a new member.
   *
   * @param newMember the member information
   * @return the created member
   */
  public Member register(NewMember newMember) {

    if (memberRepository.existsByEmail(newMember.getEmail())) {
      return null;
    }

    Member member = new Member();

    member.setEmail(newMember.getEmail());
    member.setPassword(passwordEncoder.encode(newMember.getPassword()));
    member.setTag(newMember.getTag());
    member.setAdmin(false);
    member.setDeleted(false);

    return memberRepository.save(member);
  }

  /**
   * Read a member by email.
   *
   * @param email the member email
   * @return the member if found
   */
  public Member readOneFromEmail(String email) {
    return memberRepository.findByEmail(email);
  }
}