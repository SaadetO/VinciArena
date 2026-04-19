package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.InvalidMatchStatusException;
import be.vinci.ipl.cae.demo.exceptions.MatchLineupNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberHasNoTeamException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotManagerOfTeamException;
import be.vinci.ipl.cae.demo.exceptions.UnallowedTieException;
import be.vinci.ipl.cae.demo.models.dtos.EncodeMatchResultDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryTournamentDto;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import java.util.List;
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

  @Mock
  private MatchLineupService matchLineupService;

  @InjectMocks
  private MatchService matchService;

  private Match match;
  private Member member;
  private MatchLineup team1Lineup;
  private MatchLineup team2Lineup;

  @BeforeEach
  void setUp() {
    match = new Match();
    match.setIdMatch(1L);
    match.setStatus(MatchStatus.PLAYED);

    Team team1 = new Team();
    team1.setIdTeam(10L);

    Team team2 = new Team();
    team2.setIdTeam(20L);

    match.setTeam1(team1);
    match.setTeam2(team2);

    member = new Member();

    team1Lineup = new MatchLineup();
    team1Lineup.setTeam(team1);
    team1Lineup.setScore(3);

    team2Lineup = new MatchLineup();
    team2Lineup.setTeam(team2);
    team2Lineup.setScore(1);

    Tournament tournament = new Tournament();
    tournament.setIdTournament(100L);
    tournament.setName("Tournament");
    tournament.setStatus(TournamentStatus.IN_PREPARATION);
    match.setTournament(tournament);

    match.getLineups().addAll(List.of(team1Lineup, team2Lineup));
  }

  @Test
  void confirmResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(team1Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.confirmResult(1L, member);

    // Assert
    assertTrue(team1Lineup.getHasConfirmedResults());
  }

  @Test
  void confirmResult_team2_success() {
    // Arrange
    member.setTeam(match.getTeam2());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(team2Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.confirmResult(1L, member);

    // Assert
    assertTrue(team2Lineup.getHasConfirmedResults());
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

    assertThrows(MatchLineupNotFoundException.class, () -> matchService.confirmResult(1L, member));
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

    assertThrows(
        MemberNotManagerOfTeamException.class,
        () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_already_confirmed_team1() {
    member.setTeam(match.getTeam1());
    team1Lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(team1Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.confirmResult(1L, member));
  }

  @Test
  void confirmResult_already_confirmed_team2() {
    member.setTeam(match.getTeam2());
    team2Lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(team2Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.confirmResult(1L, member));
  }

  @Test
  void contestResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(team1Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.contestResult(1L, member);

    // Assert
    assertFalse(team1Lineup.getHasConfirmedResults());
  }

  @Test
  void contestResult_team2_success() {
    // Arrange
    member.setTeam(match.getTeam2());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(team2Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    // Act
    matchService.contestResult(1L, member);

    // Assert
    assertFalse(team2Lineup.getHasConfirmedResults());
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

    assertThrows(MatchLineupNotFoundException.class, () -> matchService.contestResult(1L, member));
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

    assertThrows(
        MemberNotManagerOfTeamException.class,
        () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_already_confirmed_team1() {
    member.setTeam(match.getTeam1());
    team1Lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam1()))
        .thenReturn(Optional.of(team1Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.contestResult(1L, member));
  }

  @Test
  void contestResult_already_confirmed_team2() {
    member.setTeam(match.getTeam2());
    team2Lineup.setHasConfirmedResults(true);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByMatchAndTeam(match, match.getTeam2()))
        .thenReturn(Optional.of(team2Lineup));
    when(teamService.isManager(any(), any())).thenReturn(true);

    assertThrows(AlreadyConfirmedException.class, () -> matchService.contestResult(1L, member));
  }

  @Test
  void encodeResult_success() {
    // Arrange
    match.setStatus(MatchStatus.PLANNED);

    EncodeMatchResultDto dto = new EncodeMatchResultDto(2, 1);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchLineupRepository.findByIdIdMatch(1L)).thenReturn(List.of(team1Lineup, team2Lineup));

    // Act
    MatchSummaryDto result = matchService.encodeResult(1L, dto);

    // Assert
    assertTrue(result.status() == MatchStatus.PLAYED);
    assertTrue(team1Lineup.getScore() == 2);
    assertTrue(team2Lineup.getScore() == 1);
  }

  @Test
  void encodeResult_match_not_found() {
    when(matchRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(MatchNotFoundException.class,
        () -> matchService.encodeResult(1L, new EncodeMatchResultDto(2, 1)));
  }

  @Test
  void encodeResult_invalid_status() {
    match.setStatus(MatchStatus.PLAYED); // Already played
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(InvalidMatchStatusException.class,
        () -> matchService.encodeResult(1L, new EncodeMatchResultDto(2, 1)));
  }

  @Test
  void encodeResult_unallowed_tie() {
    match.setStatus(MatchStatus.PLANNED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(UnallowedTieException.class,
        () -> matchService.encodeResult(1L, new EncodeMatchResultDto(1, 1)));
  }

  @Test
  void encodeResult_lineup_not_found() {
    match.setStatus(MatchStatus.PLANNED);
    match.getLineups().clear(); // Trigger exception
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(MatchLineupNotFoundException.class,
        () -> matchService.encodeResult(1L, new EncodeMatchResultDto(2, 1)));
  }
}
