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

  /**
   * Constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository,
      MemberRepository memberRepository, MatchLineupRepository matchLineupRepository,
      MatchRepository matchRepository, MatchResultConfirmationRepository confirmationRepository) {
    this.tournamentRepository = tournamentRepository;
    this.memberRepository = memberRepository;
    this.matchLineupRepository = matchLineupRepository;
    this.matchRepository = matchRepository;
    this.confirmationRepository = confirmationRepository;
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
   * Periodically updates tournament statuses based on dates and registration numbers.
   * Runs every 60 seconds to synchronize database state with the current time.
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
   * Determines the next status for a tournament based on its current state and timeline.
   * * @param t The tournament to evaluate
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
      case PLANNED ->
          (!t.getStartDate().isAfter(today)) ? TournamentStatus.IN_PROGRESS : status;

      // finish tournament if endDate arrives
      case IN_PROGRESS ->
          (!t.getEndDate().isAfter(today)) ? TournamentStatus.DONE : status;

      default -> status;
    };
  }

  /**
   * Get all tournaments optionally filtered by timeframe, teams or members.
   *
   * @param timeframe  past, future, current, or null/empty for all.
   * @param teamsIds   a list of specific team ids
   * @param membersIds a list of specific member ids whose team will be used
   * @return the filtered and sorted list of tournaments.
   */
  public Iterable<TournamentSummaryDto> getTournaments(String timeframe, List<Long> teamsIds,
      List<Long> membersIds) {
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
    boolean hasTimeframe = timeframe != null && !timeframe.isBlank();
    Iterable<Tournament> allTournaments;

    // Filter by time frame first
    if (!hasTimeframe) {
      allTournaments = tournamentRepository.findAllByOrderByStartDateDesc();
    } else {
      allTournaments = switch (timeframe.toLowerCase(java.util.Locale.ROOT)) {
        case "past" ->
            tournamentRepository.findByTournamentStatusOrderByStartDateDesc(TournamentStatus.DONE);
        case "current" -> tournamentRepository.findByTournamentStatusOrderByStartDateDesc(
            TournamentStatus.IN_PROGRESS);
        case "future" -> tournamentRepository.findByTournamentStatusNotInOrderByStartDateDesc(
            List.of(TournamentStatus.DONE, TournamentStatus.IN_PROGRESS)
        );
        default -> tournamentRepository.findAllByOrderByStartDateDesc();
      };
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

      if (!hasFilters || matchTeam || matchMember) {
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
}
