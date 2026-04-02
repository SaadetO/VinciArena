package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchTeamDto;
import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.dtos.TeamSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDetailsDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.NotificationType;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Tournament service.
 */
@Service
public class TournamentService {

  private final TournamentRepository tournamentRepository;
  private final MemberRepository memberRepository;
  private final MatchLineupRepository matchLineupRepository;
  private final MatchRepository matchRepository;
  private final MatchResultConfirmationRepository confirmationRepository;
  private final NotificationService notificationService;

  /**
   * Constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository,
      MemberRepository memberRepository, MatchLineupRepository matchLineupRepository,
      MatchRepository matchRepository, MatchResultConfirmationRepository confirmationRepository, NotificationService notificationService) {
    this.tournamentRepository = tournamentRepository;
    this.memberRepository = memberRepository;
    this.matchLineupRepository = matchLineupRepository;
    this.matchRepository = matchRepository;
    this.confirmationRepository = confirmationRepository;
    this.notificationService = notificationService;
  }

  /**
   * Get complete details of a tournament (teams, matches, scores).
   */
  public TournamentDetailsDto getTournamentDetails(Long idTournament) {
    Tournament tournament = tournamentRepository.findById(idTournament).orElse(null);
    if (tournament == null) {
      return null;
    }

    // Map participating teams
    List<TeamSummaryDto> teams = tournament.getTeams().stream()
        .map(t -> new TeamSummaryDto(t.getIdTeam(), t.getName()))
        .toList();

    // Fetch and map matches
    List<Match> matchesEntities = matchRepository.findByTournamentIdTournamentOrderByDateHourAsc(
        idTournament);
    List<MatchSummaryDto> matches = new ArrayList<>();

    for (Match match : matchesEntities) {
      // Fetch lineups for results
      List<MatchLineup> lineups = matchLineupRepository.findByIdIdMatch(match.getIdMatch());

      MatchTeamDto team1Dto = createMatchTeamDto(match.getTeam1(), lineups);
      MatchTeamDto team2Dto = createMatchTeamDto(match.getTeam2(), lineups);

      // Fetch confirmation status
      Optional<MatchResultConfirmation> confirmation = confirmationRepository.findById(
          match.getIdMatch());
      boolean isConfirmed = confirmation.isPresent()
          && Boolean.TRUE.equals(confirmation.get().getConfirmationTeam1())
          && Boolean.TRUE.equals(confirmation.get().getConfirmationTeam2());

      matches.add(new MatchSummaryDto(
          match.getIdMatch(),
          match.getDateHour(),
          match.getTurn(),
          match.getStatus(),
          isConfirmed,
          team1Dto,
          team2Dto
      ));
    }

    return new TournamentDetailsDto(
        tournament.getIdTournament(),
        tournament.getName(),
        tournament.getDescription(),
        tournament.getStartDate(),
        tournament.getEndDate(),
        tournament.getRegistrationDeadline(),
        tournament.getTournamentStatus(),
        tournament.getCapacity(),
        tournament.getRegistrationsNumber(),
        teams,
        matches
    );
  }

  private MatchTeamDto createMatchTeamDto(Team team, List<MatchLineup> lineups) {
    if (team == null) {
      return null;
    }

    MatchLineup lineup = lineups.stream()
        .filter(l -> l.getTeam().getIdTeam().equals(team.getIdTeam()))
        .findFirst()
        .orElse(null);

    if (lineup == null) {
      return new MatchTeamDto(team.getIdTeam(), team.getName(), null, false, false);
    }

    return new MatchTeamDto(
        team.getIdTeam(),
        team.getName(),
        lineup.getScore(),
        lineup.isWinner(),
        lineup.isHasForfeited()
    );
  }

  /**
   * Creates and inserts a new tournament into the database.
   *
   * @param newTournament payload
   * @return created tournament
   */
  public Tournament createTournament(NewTournament newTournament) {
    Tournament tournament = new Tournament();
    tournament.setName(newTournament.name());
    tournament.setDescription(newTournament.description());
    tournament.setMaxNbOfTeams(newTournament.capacity());
    tournament.setEndDate(newTournament.endDate());
    tournament.setStartDate(newTournament.startDate());
    tournament.setRegistrationDeadline(newTournament.registrationDeadline());

    tournament = tournamentRepository.save(tournament);
    return tournament;
  }

  /**
   * Periodically updates tournament statuses based on dates and registration numbers. Runs every 60
   * seconds to synchronize database state with the current time.
   */
  @Scheduled(initialDelay = 5000, fixedDelay = 60000)
  @Transactional
  public void updateAllTournamentStates() {

    System.out.println("Tournaments: Updating database...");

    List<TournamentStatus> activeStatuses = List.of(TournamentStatus.PLANNED,
        TournamentStatus.IN_PROGRESS, TournamentStatus.REGISTRATION_OPEN,
        TournamentStatus.REGISTRATION_CLOSED);

    Iterable<Tournament> activeTournaments = tournamentRepository.findAllByTournamentStatusIn(
        activeStatuses);
    List<Tournament> updatedTournaments = new ArrayList<>();

    for (Tournament t : activeTournaments) {
      TournamentStatus currentStatus = t.getTournamentStatus();
      TournamentStatus newStatus = determineNewStatus(t);

      if (currentStatus != newStatus) {
        t.setTournamentStatus(newStatus);
        updatedTournaments.add(t);
      }
    }

    if (!updatedTournaments.isEmpty()) {
      tournamentRepository.saveAll(updatedTournaments);
      System.out.println("Updated " + updatedTournaments.size() + " tournament states.");
    } else {
      System.out.println("No update needed.");
    }
  }

  /**
   * Determines the next status for a tournament based on its current state and timeline. * @param t
   * The tournament to evaluate
   *
   * @return The calculated TournamentStatus
   */
  private TournamentStatus determineNewStatus(Tournament t) {
    LocalDateTime now = LocalDateTime.now();
    LocalDate today = now.toLocalDate();
    TournamentStatus status = t.getTournamentStatus();

    return switch (status) {

      // registrationDeadline arrives -> if not enough registrations: CANCELLED
      //                              else: REGISTRATION_CLOSED
      case REGISTRATION_OPEN -> {
        if (!t.getRegistrationDeadline().isAfter(now)) {
          yield (t.getRegistrationsNumber() < 2) ? TournamentStatus.CANCELLED
              : TournamentStatus.REGISTRATION_CLOSED;
        }
        yield status;
      }

      // cancel tournament if it's not planned and the startDate arrives
      case REGISTRATION_CLOSED ->
          (!t.getStartDate().isAfter(today)) ? TournamentStatus.CANCELLED : status;
      // start tournament if its planned and startDate arrives
      case PLANNED -> (!t.getStartDate().isAfter(today)) ? TournamentStatus.IN_PROGRESS : status;

      // finish tournament if endDate arrives
      case IN_PROGRESS -> (!t.getEndDate().isAfter(today)) ? TournamentStatus.DONE : status;

      default -> status;
    };
  }

  /**
   * Get all tournaments optionally filtered by timeframe, teams or members.
   *
   * @param statuses   a list of specific statuses to filter by
   * @param teamsIds   a list of specific team ids
   * @param membersIds a list of specific member ids whose team will be used
   * @param search     a search string to filter tournaments by name
   * @return the filtered and sorted list of tournaments.
   */
  public Iterable<TournamentSummaryDto> getTournaments(List<TournamentStatus> statuses,
      List<Long> teamsIds, List<Long> membersIds, String search) {
    Set<Long> filteredTeamIds = new HashSet<>();
    if (teamsIds != null && !teamsIds.isEmpty()) {
      filteredTeamIds.addAll(teamsIds);
    }

    Set<Long> tournamentIdsFromMembers = new HashSet<>();
    if (membersIds != null && !membersIds.isEmpty()) {
      Iterable<MatchLineup> matchLineups =
          matchLineupRepository.findByMembersIdMemberIn(membersIds);
      for (MatchLineup matchLineup : matchLineups) {
        tournamentIdsFromMembers.add(matchLineup.getMatch().getTournament().getIdTournament());
      }
    }

    boolean hasTeamFilter = teamsIds != null && !teamsIds.isEmpty();
    boolean hasMemberFilter = membersIds != null && !membersIds.isEmpty();
    boolean hasFilters = hasTeamFilter || hasMemberFilter;

    Iterable<Tournament> allTournaments;
    if (statuses == null || statuses.isEmpty()) {
      allTournaments = tournamentRepository.findAllByOrderByStartDateDesc();
    } else {
      allTournaments =
          tournamentRepository.findAllByTournamentStatusInOrderByStartDateDesc(statuses);
    }

    // Additional filtering
    List<TournamentSummaryDto> result = new ArrayList<>();
    for (Tournament t : allTournaments) {
      boolean matchMember = tournamentIdsFromMembers.contains(t.getIdTournament());
      boolean matchTeam = false;
      for (Team team : t.getTeams()) {
        if (filteredTeamIds.contains(team.getIdTeam())) {
          matchTeam = true;
          break;
        }
      }

      boolean matchSearch = search == null || search.isBlank()
          || t.getName().toLowerCase(java.util.Locale.ROOT)
          .contains(search.toLowerCase(java.util.Locale.ROOT));

      if ((!hasFilters || matchTeam || matchMember) && matchSearch) {
        result.add(mapToSummaryDto(t));
      }
    }

    return result;
  }

  private TournamentSummaryDto mapToSummaryDto(Tournament t) {
    return new TournamentSummaryDto(
        t.getIdTournament(),
        t.getName(),
        t.getDescription(),
        t.getStartDate(),
        t.getEndDate(),
        t.getRegistrationDeadline(),
        t.getTournamentStatus(),
        t.getCapacity(),
        t.getRegistrationsNumber()
    );
  }

  /**
   * Update a tournament's information.
   *
   * @param tournamentId the id of the tournament to update
   * @param newTournament the tournament with the updated data
   * @param currentMember the current member
   * @return the updated tournament if it has been updated, null otherwise.
   */
  public Tournament updateTournament(
      Long tournamentId, NewTournament newTournament, Member currentMember
  ) {
    Tournament tournament
        = doesTournamentExistInTheGivenStatus(tournamentId, TournamentStatus.IN_PREPARATION);

    if (tournament == null) {
      return null;
    }

    if (!currentMember.isAdmin()) {
      return null;
    }

    if (newTournament.name() != null) {
      tournament.setName(newTournament.name());
    }

    if (newTournament.description() != null) {
      tournament.setDescription(newTournament.description());
    }

    if (newTournament.startDate() != null) {
      tournament.setStartDate(newTournament.startDate());
    }

    if (newTournament.endDate() != null) {
      tournament.setEndDate(newTournament.endDate());
    }

    if (newTournament.capacity() != tournament.getCapacity()) {
      tournament.setMaxNbOfTeams(newTournament.capacity());
    }

    if (newTournament.registrationDeadline() != null) {
      tournament.setRegistrationDeadline(newTournament.registrationDeadline());
    }
    tournament.setTournamentStatus(TournamentStatus.IN_PREPARATION);
    return tournamentRepository.save(tournament);
  }

  /**
   * Change a tournament status from IN_PREPARATION to REGISTRATION_OPEN.
   *
   * @param tournamentId the id of the tournament to update
   * @param currentMember the current member
   * @return the tournament if it's status has been changed to REGISTRATION_OPEN, null otherwise.
   */
  public Tournament publishTournament(Long tournamentId, Member currentMember) {
    Tournament tournament
        = doesTournamentExistInTheGivenStatus(tournamentId, TournamentStatus.IN_PREPARATION);

    if (tournament == null) {
      return null;
    }

    if (!currentMember.isAdmin()) {
      return null;
    }

    tournament.setTournamentStatus(TournamentStatus.REGISTRATION_OPEN);

    tournamentRepository.save(tournament);
    notificationService.notifyAllMembers("Nouveau Tournoi !\n"
        + tournament.getName() + " vient d'ouvrir ses portes.", NotificationType.TOURNAMENT, tournamentId);

    return tournament;
  }

  private Tournament doesTournamentExistInTheGivenStatus(
      Long tournamentId, TournamentStatus status
  ) {
    Tournament tournament = tournamentRepository.findById(tournamentId).orElse(null);

    if (tournament == null) {
      return null;
    }

    if (tournament.getTournamentStatus() != status) {
      return null;
    }

    return tournament;
  }
}
