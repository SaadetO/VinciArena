package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.MemberSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.NewMember;
import be.vinci.ipl.cae.demo.models.dtos.ProfileDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.UnavailabilityRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private BCryptPasswordEncoder passwordEncoder;

  @InjectMocks
  private MemberService memberService;

  @Mock
  private SpecialtyRepository specialtyRepository;

  @Mock
  private ProfileImageRepository profileImageRepository;

  @Mock
  private be.vinci.ipl.cae.demo.repositories.TeamRepository teamRepository;

  // Test "getProfileOfMyOwnProfileAsNonManager()" does not pass without this
  @Mock
  private UnavailabilityRepository unavailabilityRepository;

  @Test
  void registerMemberWithValidEmail() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("Password1!");
    newMember.setTag("Vector");

    Member member = new Member();
    member.setEmail("test@mail.com");

    when(profileImageRepository.getProfileImageByIdImage(org.mockito.ArgumentMatchers.any()))
        .thenReturn(null);
    when(memberRepository.existsByEmail("test@mail.com")).thenReturn(false);
    when(passwordEncoder.encode("Password1!")).thenReturn("encodedPassword");
    when(memberRepository.save(org.mockito.ArgumentMatchers.any(Member.class))).thenReturn(member);
    when(specialtyRepository.getByIdSpecialty(org.mockito.ArgumentMatchers.any())).thenReturn(null);

    // Act
    Member result = memberService.register(newMember);

    // Assert
    assertEquals("test@mail.com", result.getEmail());
  }

  @Test
  void registerMemberWithExistingEmail() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("Password1!");
    newMember.setTag("Vector");

    when(memberRepository.existsByEmail("test@mail.com")).thenReturn(true);

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void registerMemberWithPasswordTooShort() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("Pass1!");
    newMember.setTag("Vector");

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void registerMemberWithoutUppercase() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("password1!");
    newMember.setTag("Vector");

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void registerMemberWithoutLowercase() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("PASSWORD1!");
    newMember.setTag("Vector");

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void registerMemberWithoutNumber() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("Password!");
    newMember.setTag("Vector");

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void registerMemberWithoutSpecialCharacter() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("Password1");
    newMember.setTag("Vector");

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void loginMemberWithValidEmailAndPassword() {

    // Arrange
    String email = "test@mail.com";
    String password = "Password1!";

    Member member = new Member();
    member.setEmail(email);
    member.setPassword("encodedPassword");
    member.setDeleted(false);

    when(memberRepository.findByEmail(email)).thenReturn(member);
    when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(true);
    when(teamRepository.findFirstByManager1OrManager2(member, member))
        .thenReturn(java.util.Optional.empty());

    // Act
    AuthenticatedUser result = memberService.login(email, password);

    // Assert
    assertNotNull(result);
    assertEquals(email, result.getEmail());
  }

  @Test
  void loginMemberWithWrongPassword() {

    // Arrange
    String email = "test@mail.com";
    String password = "Wrong1!";

    Member member = new Member();
    member.setEmail(email);
    member.setPassword("encodedPassword");
    member.setDeleted(false);

    when(memberRepository.findByEmail(email)).thenReturn(member);
    when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(false);

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.login(email, password);
    });
  }

  @Test
  void loginMemberWithUnknownEmail() {

    // Arrange
    String email = "unknown@mail.com";
    String password = "Password1!";

    when(memberRepository.findByEmail(email)).thenReturn(null);

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.login(email, password);
    });
  }

  @Test
  void loginMemberBanned() {

    // Arrange
    Member member = new Member();
    member.setEmail("test@mail.com");
    member.setPassword("encodedPassword");
    member.setDeleted(true);

    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.login("test@mail.com", "Password1!");
    });
  }


  @Test
  void banMemberWhenRequesterIsAdmin() {

    // Arrange
    Member admin = new Member();
    admin.setEmail("admin@mail.com");
    admin.setAdmin(true);

    Member target = new Member();
    target.setIdMember(1L);
    target.setDeleted(false);

    Team team = new Team();
    team.setIdTeam(1L);
    target.setTeam(team);

    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(admin);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(target));

    // Act
    memberService.banMember(1L, "admin@mail.com");

    // Assert
    assertTrue(target.isDeleted());
    assertNull(target.getTeam());
  }

  @Test
  void banMemberWithNonAdminRequester() {

    // Arrange
    Member user = new Member();
    user.setEmail("user@mail.com");
    user.setAdmin(false);

    when(memberRepository.findByEmail("user@mail.com")).thenReturn(user);

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.banMember(1L, "user@mail.com");
    });
  }


  @Test
  void banMemberWithUnknownMember() {

    // Arrange
    Member admin = new Member();
    admin.setEmail("admin@mail.com");
    admin.setAdmin(true);

    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(admin);
    when(memberRepository.findById(1L)).thenReturn(java.util.Optional.empty());

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.banMember(1L, "admin@mail.com");
    });
  }

  @Test
  void banMemberAlreadyBanned() {

    // Arrange
    Member admin = new Member();
    admin.setEmail("admin@mail.com");
    admin.setAdmin(true);

    Member target = new Member();
    target.setIdMember(1L);
    target.setDeleted(true);

    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(admin);
    when(memberRepository.findById(1L)).thenReturn(java.util.Optional.of(target));

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.banMember(1L, "admin@mail.com");
    });
  }

  @Test
  void banMemberSelfBan() {

    // Arrange
    Member admin = new Member();
    admin.setEmail("admin@mail.com");
    admin.setIdMember(1L);
    admin.setAdmin(true);

    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(admin);
    when(memberRepository.findById(1L)).thenReturn(java.util.Optional.of(admin));

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.banMember(1L, "admin@mail.com");
    });
  }

  @Test
  void banMemberTargetIsAdmin() {

    // Arrange
    Member admin = new Member();
    admin.setEmail("admin@mail.com");
    admin.setAdmin(true);

    Member target = new Member();
    target.setIdMember(1L);
    target.setAdmin(true);

    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(admin);
    when(memberRepository.findById(1L)).thenReturn(java.util.Optional.of(target));

    // Act + Assert
    assertThrows(ResponseStatusException.class, () -> {
      memberService.banMember(1L, "admin@mail.com");
    });
  }

  @Test
  void getProfileOfUnexistingMember() {
    // Arrange
    when(memberRepository.findById(1L)).thenReturn(Optional.empty());

    // Act
    ProfileDto result = memberService.getProfile(1L, "no@mail.com");

    // Assert
    assertNull(result);
  }

  @Test
  void getProfileOfExistingMemberWithNullEmail() {
    // Arrange

    //needed to pass pmd checks
    System.out.println(unavailabilityRepository);

    Specialty s = new Specialty();
    s.setName("gardien");

    Team t = new Team();

    ProfileImage avatar = new ProfileImage();
    avatar.setIdImage(1L);
    avatar.setPath("profile-1.png");

    Member m = new Member();
    m.setIdMember(1L);
    m.setTag("M1");
    m.setSpecialty(s);
    m.setProfileImage(avatar);
    m.setTeam(t);

    t.setMembers(List.of(m));

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

    // Act
    ProfileDto result = memberService.getProfile(1L, null);

    // Assert
    assertAll(
        () -> assertEquals(1L, result.getId()),
        () -> assertEquals("M1", result.getTag()),
        () -> assertEquals(s.getName(), result.getSpecialty()),
        () -> assertEquals(avatar.getPath(), result.getAvatar()),

        () -> assertNull(result.getEmail()),
        () -> assertNull(result.getCreationDate()),
        () -> assertNull(result.getIsAdmin())
    );
  }

  @Test
  void getProfileOfMyOwnProfileAsNonManager() {
    // Arrange
    Specialty s = new Specialty();

    s.setName("gardien");

    Team t = new Team();

    ProfileImage avatar = new ProfileImage();
    avatar.setIdImage(1L);
    avatar.setPath("profile-1.png");

    LocalDateTime creationDate = LocalDateTime.now();

    Member m = new Member();
    m.setIdMember(1L);
    m.setTag("M1");
    m.setEmail("m@mail.com");
    m.setSpecialty(s);
    m.setProfileImage(avatar);
    m.setCreationDate(creationDate);
    m.setTeam(t);

    t.setMembers(List.of(m));

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m));
    when(memberRepository.findByEmail("m@mail.com")).thenReturn(m);

    // Act
    ProfileDto result = memberService.getProfile(1L, "m@mail.com");

    // Assert
    assertAll(
        () -> assertEquals(1L, result.getId()),
        () -> assertEquals("M1", result.getTag()),
        () -> assertEquals(s.getName(), result.getSpecialty()),
        () -> assertEquals("profile-1.png", result.getAvatar()),
        () -> assertEquals("m@mail.com", result.getEmail()),
        () -> assertEquals(creationDate,result.getCreationDate()),
        () -> assertFalse(result.getIsAdmin())
    );
  }

  @Test
  void getProfileWithoutTeamSpecialtyOrAvatar() {
    // Arrange
    Member m = new Member();
    m.setIdMember(1L);
    m.setTag("M1");

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

    // Act
    ProfileDto result = memberService.getProfile(1L, "someone@mail.com");

    // Assert
    assertAll(() -> assertEquals(1L, result.getId()), () -> assertEquals("M1", result.getTag()),
        () -> assertNull(result.getSpecialty()), () -> assertNull(result.getAvatar()),
        () -> assertNull(result.getTeam()), () -> assertNull(result.getEmail()));
  }

  @Test
  void getProfileWithSpecialty() {
    // Arrange
    Specialty s = new Specialty();
    s.setName("gardien");

    Member m = new Member();
    m.setIdMember(1L);
    m.setTag("M1");
    m.setSpecialty(s);

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

    // Act
    ProfileDto result = memberService.getProfile(1L, "someone@mail.com");

    // Assert
    assertEquals("gardien", result.getSpecialty());
  }

  @Test
  void getAllMemberSummariesWithNoMembersInDB() {
    // Arrange
    when(memberRepository.findAllByIsDeletedOrderByTagAsc(false)).thenReturn(new Member[0]);

    // Act
    MemberSummaryDto[] result = memberService.getAllMemberSummaries();

    // Assert
    assertEquals(0, result.length);
  }

  @Test
  void getAllMemberSummariesWithMemberWithNoSpecialtyAndNoAvatar() {
    // Arrange
    Member m1 =  new Member();
    m1.setIdMember(1L);
    m1.setTag("M1");

    m1.setEmail("m1@mail.com");
    m1.setPassword("Password1!");

    Member[] members = new Member[1];
    members[0] = m1;

    when(memberRepository.findAllByIsDeletedOrderByTagAsc(false)).thenReturn(members);

    // Act
    MemberSummaryDto[] result = memberService.getAllMemberSummaries();

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(MemberSummaryDto[].class, result.getClass()),
        () -> assertEquals(1, result.length),
        () -> assertEquals(1L, result[0].getId()),
        () -> assertEquals("M1", result[0].getTag()),
        () -> assertNull(result[0].getSpecialty()),
        () -> assertNull(result[0].getAvatar())
    );
  }

  @Test
  void getAllMemberSummariesWithMemberWithSpecialtyAndAvatar() {
    // Arrange
    Specialty s = new Specialty();
    s.setName("gardien");

    ProfileImage avatar = new ProfileImage();
    avatar.setIdImage(1L);
    avatar.setPath("profile-1.png");

    Member m1 =  new Member();
    m1.setIdMember(1L);
    m1.setTag("M1");
    m1.setSpecialty(s);
    m1.setProfileImage(avatar);

    m1.setEmail("m1@mail.com");
    m1.setPassword("Password1!");

    Member[] members = new Member[1];
    members[0] = m1;

    when(memberRepository.findAllByIsDeletedOrderByTagAsc(false)).thenReturn(members);

    // Act
    MemberSummaryDto[] result = memberService.getAllMemberSummaries();

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(MemberSummaryDto[].class, result.getClass()),
        () -> assertEquals(1, result.length),
        () -> assertEquals(1L, result[0].getId()),
        () -> assertEquals("M1", result[0].getTag()),
        () -> assertEquals(s.getName(), result[0].getSpecialty()),
        () -> assertEquals(avatar.getPath(), result[0].getAvatar())
    );
  }
}
