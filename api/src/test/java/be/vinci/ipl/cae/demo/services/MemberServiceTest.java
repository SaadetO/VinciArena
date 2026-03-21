package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.NewMember;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
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

  @Test
  void registerMemberWithValidEmail() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("123");
    newMember.setTag("Vector");

    Member member = new Member();
    member.setEmail("test@mail.com");

    when(profileImageRepository.getProfileImageByIdImage(org.mockito.ArgumentMatchers.any()))
        .thenReturn(null);
    when(memberRepository.existsByEmail("test@mail.com")).thenReturn(false);
    when(passwordEncoder.encode("123")).thenReturn("encodedPassword");
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
    newMember.setPassword("123");
    newMember.setTag("Vector");

    when(memberRepository.existsByEmail("test@mail.com")).thenReturn(true);
    assertThrows(ResponseStatusException.class, () -> {
      memberService.register(newMember);
    });
  }

  @Test
  void loginMemberWithValidEmailAndPassword(){
    // Arrange
    String email = "test@mail.com";
    String password = "123";

    Member member = new Member();
    member.setEmail(email);
    member.setPassword("encodedPassword");

    when(memberRepository.findByEmail(email)).thenReturn(member);
    when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(true);

    // Act
    AuthenticatedUser result = memberService.login(email, password);

    // Assert
    assertNotNull(result);
    assertEquals(email, result.getEmail());
  }

  @Test
  void loginMemberWithWrongPassword(){

    String email = "test@mail.com";
    String password = "wrong";

    Member member = new Member();
    member.setEmail(email);
    member.setPassword("encodedPassword");

    when(memberRepository.findByEmail(email)).thenReturn(member);
    when(passwordEncoder.matches(password, "encodedPassword")).thenReturn(false);

    assertThrows(ResponseStatusException.class, () -> {
      memberService.login(email, password);
    });
  }

  @Test
  void loginMemberWithUnknownEmail(){

    String email = "unknown@mail.com";
    String password = "123";

    when(memberRepository.findByEmail(email)).thenReturn(null);

    assertThrows(ResponseStatusException.class, () -> {
      memberService.login(email, password);
    });
  }
}