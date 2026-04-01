package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.entities.Member;
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

  private MatchRepository matchRepository;

  private MatchResultConfirmationRepository confirmationRepository;

  private TournamentService tournamentService;

  private Member memberAdmin;

  private Tournament tournament;

  private NewTournament newTournament;

  @BeforeEach
  void setUp() {
    tournamentService = new TournamentService(
        tournamentRepository,
        memberRepository,
        matchLineupRepository,
        matchRepository,
        confirmationRepository
    );

    memberAdmin = new Member();
    memberAdmin.setAdmin(true);

    newTournament = new NewTournament(
        "un1", "ud1",
        LocalDate.of(2028, 1, 1),
        LocalDate.of(2028, 1, 31), 4,
        LocalDate.of(2027, 12, 1).atStartOfDay()
    );
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
  void updateTournamentAsAdminWithTournamentStatusNotInPreparation () {
    // Arrange

    tournament = new Tournament();
    tournament.setIdTournament(1L);
    tournament.setTournamentStatus(TournamentStatus.REGISTRATION_OPEN);

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
    tournament.setTournamentStatus(TournamentStatus.IN_PREPARATION);

    when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

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
    tournament.setMaxNbOfTeams(8);
    tournament.setTournamentStatus(TournamentStatus.IN_PREPARATION);

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
            LocalDate.of(2027, 12, 1),result.getRegistrationDeadline()
        )
    );
    verify(tournamentRepository, times(1)).save(tournament);
  }
}