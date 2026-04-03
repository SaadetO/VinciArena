package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.exceptions.DuplicateRegistrationException;
import be.vinci.ipl.cae.demo.exceptions.InactiveTeamException;
import be.vinci.ipl.cae.demo.exceptions.InsufficientTeamMembersException;
import be.vinci.ipl.cae.demo.exceptions.NotManagerException;
import be.vinci.ipl.cae.demo.exceptions.RegistrationClosedException;
import be.vinci.ipl.cae.demo.exceptions.TournamentNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

  @Mock
  private TournamentRepository tournamentRepository;

  private MemberRepository memberRepository;

  private MatchLineupRepository matchLineupRepository;

  @Mock
  private MatchRepository matchRepository;

  @Mock
  private MatchResultConfirmationRepository confirmationRepository;

  @Mock
  private TeamService teamService;

  @Mock
  private NotificationService notificationService;

  private TournamentService tournamentService;

  private Member memberAdmin;

  private Tournament tournament;

  private NewTournament newTournament;
  
  private Member manager;
  
  private Team team;

  @BeforeEach
  void setUp() {
    tournamentService = new TournamentService(
        tournamentRepository,
        memberRepository,
        matchLineupRepository,
        matchRepository,
        confirmationRepository,
        teamService,
        notificationService
    );

    memberAdmin = new Member();
    memberAdmin.setAdmin(true);

    newTournament = new NewTournament(
        "un1", "ud1",
        LocalDate.of(2028, 1, 1),
        LocalDate.of(2028, 1, 31), 4,
        LocalDate.of(2027, 12, 1).atStartOfDay()
    );

    manager = new Member();
    manager.setIdMember(1L);

    team = new Team();
    team.setIdTeam(10L);
    team.setName("Test Team");
    team.setIsActive(true);
    team.setManager1(manager);
    manager.setTeam(team);

    Member m2 = new Member(); m2.setIdMember(2L);
    Member m3 = new Member(); m3.setIdMember(3L);
    Member m4 = new Member(); m4.setIdMember(4L);
    team.setMembers(java.util.List.of(manager, m2, m3, m4));

    tournament = new Tournament();
    tournament.setIdTournament(100L);
    tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
    tournament.setRegistrationDeadline(java.time.LocalDateTime.now().plusDays(5));
    tournament.setCapacity(8);
  }

  @Test
  void updateUnexistingTournament() {
    // Arrange
    when(tournamentRepository.findById(1L)).thenReturn(Optional.empty());

    // Act
    Tournament result = tournamentService.updateTournament(
        1L, newTournament, memberAdmin
    );

    // Assert
    assertNull(result);
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void updateTournamentAsAdminWithTournamentStatusNotInPreparation() {
    // Arrange

    tournament = new Tournament();
    tournament.setIdTournament(1L);
    tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);

    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

    // Act
    Tournament result = tournamentService.updateTournament(
        1L, newTournament, memberAdmin
    );

    // Assert
    assertNull(result);
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void updateTournamentAsANonAdminMember() {
    // Arrange
    Member nonAdminMember = new Member();
    nonAdminMember.setIdMember(2L);
    nonAdminMember.setAdmin(false);

    tournament = new Tournament();
    tournament.setIdTournament(1L);
    tournament.setStatus(TournamentStatus.IN_PREPARATION);

    // Act
    Tournament result = tournamentService.updateTournament(
        1L, newTournament, nonAdminMember
    );

    // Arrange
    assertNull(result);
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void updateTournamentAsAdminWithTournamentStatusInPreparation() {
    // Arrange
    tournament = new Tournament();
    tournament.setIdTournament(1L);
    tournament.setName("t1");
    tournament.setDescription("d1");
    tournament.setStartDate(LocalDate.of(2027, 1, 1));
    tournament.setEndDate(LocalDate.of(2027, 1, 31));
    tournament.setRegistrationDeadline(
        LocalDate.of(2026, 12, 1).atStartOfDay()
    );
    tournament.setCapacity(8);
    tournament.setStatus(TournamentStatus.IN_PREPARATION);

    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
    when(tournamentRepository.save(any(Tournament.class))).thenReturn(tournament);

    // Act
    Tournament result = tournamentService.updateTournament(
        1L, newTournament, memberAdmin
    );

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals("un1", result.getName()),
        () -> assertEquals("ud1", result.getDescription()),
        () -> assertEquals(LocalDate.of(2028, 1, 1), result.getStartDate()),
        () -> assertEquals(LocalDate.of(2028, 1, 31), result.getEndDate()),
        () -> assertEquals(4, result.getCapacity()),
        () -> assertEquals(
            LocalDate.of(2027, 12, 1).atStartOfDay(), result.getRegistrationDeadline()
        )
    );
    verify(tournamentRepository, times(1)).save(tournament);
  }

  @Test
  void registerTeamValid() {
    // Arrange
    when(tournamentRepository.findById(100L)).thenReturn(Optional.of(tournament));
    when(teamService.isManager(team, manager)).thenReturn(true);

    // Act
    boolean result = tournamentService.registerTeam(100L, manager);

    // Assert
    assertTrue(result);
    assertTrue(tournament.getTeams().contains(team));
    assertTrue(team.getTournaments().contains(tournament));
    verify(tournamentRepository).save(tournament);
  }

  @Test
  void registerTeamInvalidTournament() {
    // Arrange
    when(teamService.isManager(team, manager)).thenReturn(true);
    when(tournamentRepository.findById(100L)).thenReturn(Optional.empty());

    // Act & Assert
    assertThrows(TournamentNotFoundException.class, () -> tournamentService.registerTeam(100L, manager));
  }

  @Test
  void registerTeamNotActiveTeam() {
    // Arrange
    team.setIsActive(false);

    // Act & Assert
    assertThrows(InactiveTeamException.class, () -> tournamentService.registerTeam(100L, manager));
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void registerTeamNotManager() {
    // Arrange
    when(teamService.isManager(team, manager)).thenReturn(false);

    // Act & Assert
    assertThrows(NotManagerException.class, () -> tournamentService.registerTeam(100L, manager));
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void registerTeamNotEnoughMembers() {
    // Arrange
    team.setMembers(java.util.List.of(manager, new Member())); // only 2 members
    when(teamService.isManager(team, manager)).thenReturn(true);

    // Act & Assert
    assertThrows(InsufficientTeamMembersException.class, () -> tournamentService.registerTeam(100L, manager));
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void registerTeamAlreadyRegistered() {
    // Arrange
    when(tournamentRepository.findById(100L)).thenReturn(Optional.of(tournament));
    when(teamService.isManager(team, manager)).thenReturn(true);
    team.getTournaments().add(tournament);

    // Act & Assert
    assertThrows(DuplicateRegistrationException.class, () -> tournamentService.registerTeam(100L, manager));
    verify(tournamentRepository, never()).save(any());
  }

  @Test
  void registerTeamRegistrationClosed() {
    // Arrange
    tournament.setStatus(TournamentStatus.REGISTRATION_CLOSED);
    when(tournamentRepository.findById(100L)).thenReturn(Optional.of(tournament));
    when(teamService.isManager(team, manager)).thenReturn(true);

    // Act & Assert
    assertThrows(RegistrationClosedException.class, () -> tournamentService.registerTeam(100L, manager));
    verify(tournamentRepository, never()).save(any());
  }
}