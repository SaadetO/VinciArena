package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberHasNoTeamException;
import be.vinci.ipl.cae.demo.exceptions.LineupNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotManagerOfTeamException;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
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
  private MatchLineupRepository matchLineupRepository;

  @Mock
  private MemberService memberService;

  @Mock
  private TeamService teamService;

  @InjectMocks
  private MatchService matchService;

  private Match match;
  private Member member;
  private MatchLineup lineup;

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

    lineup = new MatchLineup();
  }

  @Test
  void confirmResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.confirmResult(1L, member);

    // Assert
    assertTrue(lineup.getHasConfirmedResults());
    verify(matchLineupRepository).save(lineup);
  }

  @Test
  void confirmResult_team2_success() {
    // Arrange
    member.setTeam(match.getTeam2());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.confirmResult(1L, member);

    // Assert
    assertTrue(lineup.getHasConfirmedResults());
    verify(matchLineupRepository).save(lineup);
  }

  @Test
  void confirmResult_match_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(MatchNotFoundException.class,
        () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_result_not_found() {
    member.setTeam(match.getTeam1());
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.empty());
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(LineupNotFoundException.class, () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_user_no_team() {
    member.setTeam(null);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(MemberHasNoTeamException.class, () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_user_not_in_match() {
    Team otherTeam = new Team();
    otherTeam.setIdTeam(99L);
    member.setTeam(otherTeam);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(MemberNotManagerOfTeamException.class,
        () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_already_confirmed_team1() {
    member.setTeam(match.getTeam1());
    lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_already_confirmed_team2() {
    member.setTeam(match.getTeam2());
    lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.confirmResult(1L, member));
  }

  @Test
  void contestResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.contestResult(1L, member);

    // Assert
    assertFalse(lineup.getHasConfirmedResults());
    verify(matchLineupRepository).save(lineup);
  }

  @Test
  void contestResult_team2_success() {
    // Arrange
    member.setTeam(match.getTeam2());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.contestResult(1L, member);

    // Assert
    assertFalse(lineup.getHasConfirmedResults());
    verify(matchLineupRepository).save(lineup);
  }

  @Test
  void contestResult_match_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(MatchNotFoundException.class,
        () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_result_not_found() {
    member.setTeam(match.getTeam1());
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.empty());
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(LineupNotFoundException.class, () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_user_no_team() {
    member.setTeam(null);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(MemberHasNoTeamException.class, () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_user_not_in_match() {
    Team otherTeam = new Team();
    otherTeam.setIdTeam(99L);
    member.setTeam(otherTeam);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(MemberNotManagerOfTeamException.class,
        () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_already_confirmed_team1() {
    member.setTeam(match.getTeam1());
    lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_already_confirmed_team2() {
    member.setTeam(match.getTeam2());
    lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.contestResult(1L, member));
  }
}
