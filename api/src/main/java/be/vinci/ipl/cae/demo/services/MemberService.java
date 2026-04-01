package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.MemberSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.NewMember;
import be.vinci.ipl.cae.demo.models.dtos.ProfileDto;
import be.vinci.ipl.cae.demo.models.dtos.UserSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.UnavailabilityRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.transaction.Transactional;
import java.util.Date;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
   * @param specialtyRepository      the specialty repository
   * @param profileImageRepository   the profile image repository
   */
  public MemberService(BCryptPasswordEncoder passwordEncoder,
      MemberRepository memberRepository,
      UnavailabilityRepository unavailabilityRepository, SpecialtyRepository specialtyRepository,
      ProfileImageRepository profileImageRepository) {
    this.passwordEncoder = passwordEncoder;
    this.memberRepository = memberRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.specialtyRepository = specialtyRepository;
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
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
    }

    if (member.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Compte banni");
    }

    if (!passwordEncoder.matches(password, member.getPassword())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
    }


    return createJwtToken(email);
  }

  private void validatePassword(String password) {
    if (password == null || password.length() < 8) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Le mot de passe doit contenir au moins 8 caractères"
      );
    }

    if (!password.matches(".*[A-Z].*")) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Le mot de passe doit contenir au moins une majuscule"
      );
    }

    if (!password.matches(".*[a-z].*")) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Le mot de passe doit contenir au moins une minuscule"
      );
    }

    if (!password.matches(".*\\d.*")) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Le mot de passe doit contenir au moins un chiffre"
      );
    }

    if (!password.matches(".*[^a-zA-Z0-9].*")) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Le mot de passe doit contenir au moins un caractère spécial"
      );
    }
  }

  /**
   * Register a new member.
   *
   * @param newMember the member information
   * @return the created member
   */
  public Member register(NewMember newMember) {

    validatePassword(newMember.getPassword());

    if (memberRepository.existsByEmail(newMember.getEmail())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé");
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
   * Update a member's profile image.
   *
   * @param member       the member
   * @param profileImage the new profile image
   * @return true if updated, false if the image is invalid
   */
  public boolean updateAvatar(Member member, ProfileImage profileImage) {
    if (profileImage == null || profileImage.getIdImage() == null) {
      return false;
    }
    ProfileImage existingImage =
        profileImageRepository.getProfileImageByIdImage(profileImage.getIdImage());
    if (existingImage == null) {
      return false;
    }
    member.setProfileImage(existingImage);
    memberRepository.save(member);
    return true;
  }

  /**
   * Update a member's profile image.
   *
   * @param member       the member
   * @param specialtyId the new profile image
   * @return true if updated, false if the image is invalid
   */
  public boolean updateSpecialty(Member member, Long specialtyId) {
    if (specialtyId == null || specialtyId <= 0) {
      return false;
    }
    Specialty existingSpecialty =
        specialtyRepository.getByIdSpecialty(specialtyId);
    if (existingSpecialty == null) {
      return false;
    }
    member.setSpecialty(existingSpecialty);
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
   * Get member summary DTO for lists.
   *
   * @param member the member entity
   * @return the user summary DTO
   */
  public UserSummaryDto getUserSummary(Member member) {
    if (member == null) {
      return null;
    }
    return UserSummaryDto.builder()
        .id(member.getIdMember())
        .tag(member.getTag())
        .avatar(member.getProfileImage() != null ? member.getProfileImage().getPath() : null)
        .build();
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

  public Iterable<Member> getAllMembers() {
    return memberRepository.findAll();
  }

  /**
   * Get all members as lightweight summaries (no sensitive data).
   *
   * @return array of MemberSummaryDto
   */
  public MemberSummaryDto[] getAllMemberSummaries() {
    Member[] members = memberRepository.findAllByIsDeletedOrderByTagAsc(false);
    MemberSummaryDto[] summaries = new MemberSummaryDto[members.length];
    for (int i = 0; i < members.length; i++) {
      Member m = members[i];
      summaries[i] = MemberSummaryDto.builder()
          .id(m.getIdMember())
          .tag(m.getTag())
          .specialty(m.getSpecialty() != null ? m.getSpecialty().getName() : null)
          .avatar(m.getProfileImage() != null ? m.getProfileImage().getPath() : null)
          .build();
    }
    return summaries;
  }

  /**
   * Ban a member from the platform (soft delete).
   *
   * @param id             the ID of the member to ban
   * @param requesterEmail the email of the authenticated user
   * @throws ResponseStatusException if the user is not authenticated,
   *                                 not admin, or if the operation is invalid
   */
  @Transactional
  public void banMember(Long id, String requesterEmail) {
    Member requester = memberRepository.findByEmail(requesterEmail);

    if (requester == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
          "Utilisateur non authentifié");
    }

    if (!requester.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Accès réservé aux admins");
    }

    Member member = memberRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Membre introuvable"));

    if (member.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Impossible de bannir un admin");
    }

    if (member.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Membre déjà banni");
    }

    if (member.getIdMember().equals(requester.getIdMember())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Tu ne peux pas te bannir toi-même");
    }

    member.setDeleted(true);
    memberRepository.save(member);
  }
}