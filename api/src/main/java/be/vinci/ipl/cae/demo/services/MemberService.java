package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.NewMember;
import be.vinci.ipl.cae.demo.models.dtos.ProfileDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.UnavailabilityRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
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
  private final UnavailabilityRepository unavailabilityRepository;
  private final SpecialtyRepository specialtyRepository;
  private final ProfileImageRepository profileImageRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder          the password encoder
   * @param memberRepository         the member repository
   * @param unavailabilityRepository the unavailability repository
   */
  public MemberService(BCryptPasswordEncoder passwordEncoder,
      MemberRepository memberRepository,
      UnavailabilityRepository unavailabilityRepository, SpecialtyRepository specialityRepository,
      ProfileImageRepository profileImageRepository) {
    this.passwordEncoder = passwordEncoder;
    this.memberRepository = memberRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.specialtyRepository = specialityRepository;
    this.profileImageRepository = profileImageRepository;
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
    Member member = memberRepository.findByEmail(email);
    authenticatedUser.setId(member.getIdMember());
    authenticatedUser.setEmail(email);
    authenticatedUser.setTag(member.getTag());
    authenticatedUser.setToken(token);
    authenticatedUser.setAdmin(member.isAdmin());

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
   * @param email    the member email
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
    member.setSpecialty(specialtyRepository.getByIdSpecialty(newMember.getSpecialtyId()));
    member.setProfileImage(
        profileImageRepository.getProfileImageByIdImage(newMember.getProfileImageId()));
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

  /**
   * Update a member's password.
   *
   * @param newPassword the new password
   * @return true if updated, false if the member is not found
   */
  public boolean updatePassword(Member member, String newPassword) {
    member.setPassword(passwordEncoder.encode(newPassword));
    memberRepository.save(member);
    return true;
  }

  /**
   * Get member profile DTO with privacy rules.
   *
   * @param requestedId        the requested member ID
   * @param authenticatedEmail the authenticated user email
   * @return the profile DTO or null if not found
   */
  public ProfileDto getProfile(Long requestedId, String authenticatedEmail) {
    Member requestedMember = memberRepository.findById(requestedId).orElse(null);
    if (requestedMember == null) {
      return null;
    }

    Member authMember =
        authenticatedEmail != null
            ? memberRepository.findByEmail(authenticatedEmail)
            : null;
    boolean isSelf = authMember != null && authMember.getIdMember().equals(requestedId);

    ProfileDto.ProfileDtoBuilder builder = ProfileDto.builder()
        .id(requestedMember.getIdMember())
        .tag(requestedMember.getTag())
        .specialty(
            requestedMember.getSpecialty() != null
                ? requestedMember.getSpecialty().getName()
                : null
        )
        .avatar(
            requestedMember.getProfileImage() != null
                ? requestedMember.getProfileImage().getPath()
                : null
        );

    Team team = requestedMember.getTeam();
    if (team != null) {
      boolean isManager =
          (team.getManager1() != null && team.getManager1().getIdMember().equals(requestedId))
              || (team.getManager2() != null && team.getManager2().getIdMember()
              .equals(requestedId));
      builder.team(ProfileDto.TeamDto.builder()
          .id(team.getIdTeam())
          .name(team.getName())
          .isManager(isManager)
          .build());
    }

    if (isSelf) {
      builder.email(requestedMember.getEmail())
          .creationDate(requestedMember.getCreationDate())
          .isAdmin(requestedMember.isAdmin());

      var unavailabilities = StreamSupport.stream(
              unavailabilityRepository.findByMember(requestedMember).spliterator(), false)
          .map(u -> ProfileDto.UnavailabilityDto.builder()
              .id(u.getIdUnavailability())
              .startDate(u.getStartDate())
              .endDate(u.getEndDate())
              .build())
          .collect(Collectors.toList());
      builder.unavailabilities(unavailabilities);
    }

    return builder.build();
  }

  /**
   * Toggles the isAdmin property of a member.
   *
   * @param idMember id of the target member
   * @return true if it succeeded and false otherwise
   */
  public boolean toggleAdmin(Long idMember) {
    Member member = memberRepository.findById(idMember).orElse(null);
    if (member == null) {
      return false;
    }
    member.setAdmin(!member.isAdmin());
    memberRepository.save(member);
    return true;
  }

  public Member[] getAllMembers() {
    return memberRepository.findAllByIsDeleted(false);
  }
}