package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberHasNoTeamException;
import be.vinci.ipl.cae.demo.exceptions.ResultNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UserNotInMatchException;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class MatchServiceTest {

  @Mock
  private MatchRepository matchRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private MatchResultConfirmationRepository confirmationRepository;

  @InjectMocks
  private MatchService matchService;

  private Match match;
  private Member member;
  private MatchResultConfirmation confirmation;

  @BeforeEach
  void setUp() {
    match = new Match();
    match.setIdMatch(1L);

    Team team1 = new Team();
    team1.setIdTeam(10L);

    Team team2 = new Team();
    team2.setIdTeam(20L);

    match.setTeam1(team1);
    match.setTeam2(team2);

    member = new Member();
    member.setEmail("test@mail.com");

    confirmation = new MatchResultConfirmation();
    confirmation.setId(1L);
  }

  @Test
  void confirmResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    // Act
    matchService.confirmResult(1L, "test@mail.com");

    // Assert
    assertTrue(confirmation.getConfirmationTeam1());
    verify(confirmationRepository).save(confirmation);
  }

  @Test
  void confirmResult_team2_success() {
    // Arrange
    member.setTeam(match.getTeam2());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    // Act
    matchService.confirmResult(1L, "test@mail.com");

    // Assert
    assertTrue(confirmation.getConfirmationTeam2());
  }

  @Test
  void confirmResult_match_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(MatchNotFoundException.class,
        () -> matchService.confirmResult(1L, "test@mail.com"));
  }

  @Test
  void confirmResult_result_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(ResultNotFoundException.class,
        () -> matchService.confirmResult(1L, "test@mail.com"));
  }

  @Test
  void confirmResult_user_no_team() {
    member.setTeam(null);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(MemberHasNoTeamException.class,
        () -> matchService.confirmResult(1L, "test@mail.com"));
  }

  @Test
  void confirmResult_user_not_in_match() {
    Team otherTeam = new Team();
    otherTeam.setIdTeam(99L);
    member.setTeam(otherTeam);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(UserNotInMatchException.class,
        () -> matchService.confirmResult(1L, "test@mail.com"));
  }

  @Test
  void confirmResult_already_confirmed_team1() {
    member.setTeam(match.getTeam1());
    confirmation.setConfirmationTeam1(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(AlreadyConfirmedException.class,
        () -> matchService.confirmResult(1L, "test@mail.com"));
  }

  @Test
  void confirmResult_already_confirmed_team2() {
    member.setTeam(match.getTeam2());
    confirmation.setConfirmationTeam2(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(AlreadyConfirmedException.class,
        () -> matchService.confirmResult(1L, "test@mail.com"));
  }

  @Test
  void contestResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    // Act
    matchService.contestResult(1L, "test@mail.com");

    // Assert
    assertFalse(confirmation.getConfirmationTeam1());
    verify(confirmationRepository).save(confirmation);
  }

  @Test
  void contestResult_team2_success() {
    // Arrange
    member.setTeam(match.getTeam2());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    // Act
    matchService.contestResult(1L, "test@mail.com");

    // Assert
    assertFalse(confirmation.getConfirmationTeam2());
  }

  @Test
  void contestResult_match_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(MatchNotFoundException.class,
        () -> matchService.contestResult(1L, "test@mail.com"));
  }

  @Test
  void contestResult_result_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(ResultNotFoundException.class,
        () -> matchService.contestResult(1L, "test@mail.com"));
  }

  @Test
  void contestResult_user_no_team() {
    member.setTeam(null);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(MemberHasNoTeamException.class,
        () -> matchService.contestResult(1L, "test@mail.com"));
  }

  @Test
  void contestResult_user_not_in_match() {
    Team otherTeam = new Team();
    otherTeam.setIdTeam(99L);
    member.setTeam(otherTeam);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(UserNotInMatchException.class,
        () -> matchService.contestResult(1L, "test@mail.com"));
  }

  @Test
  void contestResult_already_confirmed_team1() {
    member.setTeam(match.getTeam1());
    confirmation.setConfirmationTeam1(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    assertThrows(AlreadyConfirmedException.class,
        () -> matchService.contestResult(1L, "test@mail.com"));
  }


}
