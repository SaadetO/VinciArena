package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UnauthorizedException;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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

  // ========================= BAN MEMBER =========================

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

    // Act & Assert
    assertThrows(ForbiddenException.class, () -> {
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
    when(memberRepository.findById(1L)).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(MemberNotFoundException.class, () -> {
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
    when(memberRepository.findById(1L)).thenReturn(Optional.of(target));

    // Act & Assert
    assertThrows(BadRequestException.class, () -> {
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
    when(memberRepository.findById(1L)).thenReturn(Optional.of(admin));

    // Act & Assert
    assertThrows(ForbiddenException.class, () -> {
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
    when(memberRepository.findById(1L)).thenReturn(Optional.of(target));

    // Act & Assert
    assertThrows(ForbiddenException.class, () -> {
      memberService.banMember(1L, "admin@mail.com");
    });
  }

  @Test
  void banMemberRequesterNotFound() {

    // Arrange
    when(memberRepository.findByEmail("admin@mail.com")).thenReturn(null);

    // Act & Assert
    assertThrows(UnauthorizedException.class, () -> {
      memberService.banMember(1L, "admin@mail.com");
    });
  }

  // ========================= IS LAST MEMBER =========================

  @Test
  void isLastMemberTrue() {

    // Arrange
    Member m = new Member();
    m.setIdMember(1L);

    Team team = new Team();
    team.setMembers(java.util.List.of(m));

    m.setTeam(team);

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

    // Act
    boolean result = memberService.isLastMember(1L);

    // Assert
    assertTrue(result);
  }

  @Test
  void isLastMemberFalseWhenMultipleMembers() {

    // Arrange
    Member m1 = new Member();
    m1.setIdMember(1L);

    Member m2 = new Member();
    m2.setIdMember(2L);

    Team team = new Team();
    team.setMembers(java.util.List.of(m1, m2));

    m1.setTeam(team);

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m1));

    // Act
    boolean result = memberService.isLastMember(1L);

    // Assert
    assertFalse(result);
  }

  @Test
  void isLastMemberFalseWhenNoTeam() {

    // Arrange
    Member m = new Member();
    m.setIdMember(1L);

    when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

    // Act
    boolean result = memberService.isLastMember(1L);

    // Assert
    assertFalse(result);
  }

  @Test
  void isLastMemberThrowsWhenMemberNotFound() {

    // Arrange
    when(memberRepository.findById(1L)).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(MemberNotFoundException.class, () -> {
      memberService.isLastMember(1L);
    });
  }
}