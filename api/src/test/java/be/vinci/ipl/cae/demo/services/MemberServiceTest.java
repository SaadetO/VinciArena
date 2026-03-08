package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.NewMember;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
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

  @Test
  void registerMemberWithValidEmail() {

    // Arrange
    NewMember newMember = new NewMember();
    newMember.setEmail("test@mail.com");
    newMember.setPassword("123");
    newMember.setTag("Vector");

    Member member = new Member();
    member.setEmail("test@mail.com");

    when(memberRepository.existsByEmail("test@mail.com")).thenReturn(false);
    when(passwordEncoder.encode("123")).thenReturn("encodedPassword");
    when(memberRepository.save(org.mockito.ArgumentMatchers.any(Member.class))).thenReturn(member);

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

    // Act
    Member result = memberService.register(newMember);

    // Assert
    assertNull(result);
  }

}