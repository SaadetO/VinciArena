package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.DuplicateRegistrationException;
import be.vinci.ipl.cae.demo.exceptions.ImpossibleTournamentException;
import be.vinci.ipl.cae.demo.exceptions.InactiveTeamException;
import be.vinci.ipl.cae.demo.exceptions.InsufficientTeamMembersException;
import be.vinci.ipl.cae.demo.exceptions.NotManagerException;
import be.vinci.ipl.cae.demo.exceptions.RegistrationClosedException;
import be.vinci.ipl.cae.demo.exceptions.TournamentNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.TournamentNotInRegistrationClosedException;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchTeamDto;
import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.dtos.TeamSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentDetailsDto;
import be.vinci.ipl.cae.demo.models.dtos.TournamentSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
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
import be.vinci.ipl.cae.demo.specifications.TournamentSpecifications;
import be.vinci.ipl.cae.demo.utils.BracketGenerator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
  private final TeamService teamService;

  /**
   * Constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository,
      MemberRepository memberRepository, MatchLineupRepository matchLineupRepository,
      MatchRepository matchRepository, MatchResultConfirmationRepository confirmationRepository,
      TeamService teamService, NotificationService notificationService) {
    this.tournamentRepository = tournamentRepository;
    this.memberRepository = memberRepository;
    this.matchLineupRepository = matchLineupRepository;
    this.matchRepository = matchRepository;
    this.confirmationRepository = confirmationRepository;
    this.notificationService = notificationService;
    this.teamService = teamService;
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
        .map(t -> new TeamSummaryDto(t.getIdTeam(), t.getName())).toList();

    // Fetch and map matches
    List<Match> matchesEntities =
        matchRepository.findByTournamentIdTournamentOrderByDateHourAsc(idTournament);
    List<MatchSummaryDto> matches = new ArrayList<>();

    for (Match match : matchesEntities) {
      // Fetch lineups for results
      List<MatchLineup> lineups = matchLineupRepository.findByIdIdMatch(match.getIdMatch());

      MatchTeamDto team1Dto = createMatchTeamDto(match.getTeam1(), lineups);
      MatchTeamDto team2Dto = createMatchTeamDto(match.getTeam2(), lineups);

      // Fetch confirmation status
      Optional<MatchResultConfirmation> confirmation =
          confirmationRepository.findById(match.getIdMatch());
      boolean isConfirmed =
          confirmation.isPresent() && Boolean.TRUE.equals(confirmation.get().getConfirmationTeam1())
              && Boolean.TRUE.equals(confirmation.get().getConfirmationTeam2());

      matches.add(new MatchSummaryDto(match.getIdMatch(), match.getDateHour(), match.getTurn(),
          match.getStatus(), isConfirmed, team1Dto, team2Dto));
    }

    return new TournamentDetailsDto(tournament.getIdTournament(), tournament.getName(),
        tournament.getDescription(), tournament.getStartDate(), tournament.getEndDate(),
        tournament.getRegistrationDeadline(), tournament.getStatus(), tournament.getCapacity(),
        tournament.getRegistrationsNumber(), teams, matches);
  }

  private MatchTeamDto createMatchTeamDto(Team team, List<MatchLineup> lineups) {
    if (team == null) {
      return null;
    }

    MatchLineup lineup = lineups.stream()
        .filter(l -> l.getTeam().getIdTeam().equals(team.getIdTeam())).findFirst().orElse(null);

    if (lineup == null) {
      return new MatchTeamDto(team.getIdTeam(), team.getName(), null, false, false);
    }

    return new MatchTeamDto(team.getIdTeam(), team.getName(), lineup.getScore(), lineup.isWinner(),
        lineup.isHasForfeited());
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
    tournament.setCapacity(newTournament.capacity());
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

    List<TournamentStatus> activeStatuses =
        List.of(TournamentStatus.PLANNED, TournamentStatus.IN_PROGRESS,
            TournamentStatus.REGISTRATION_OPEN, TournamentStatus.REGISTRATION_CLOSED);

    Iterable<Tournament> activeTournaments = tournamentRepository.findAllByStatusIn(activeStatuses);
    List<Tournament> updatedTournaments = new ArrayList<>();

    for (Tournament t : activeTournaments) {
      TournamentStatus currentStatus = t.getStatus();
      TournamentStatus newStatus = determineNewStatus(t);

      if (currentStatus != newStatus) {
        t.setStatus(newStatus);
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
    TournamentStatus status = t.getStatus();

    return switch (status) {
      // registrationDeadline arrives -> if not enough registrations: CANCELLED
      //                              else: REGISTRATION_CLOSED
      case REGISTRATION_OPEN -> {
        if (!t.getRegistrationDeadline().isAfter(now)) {
          yield (t.getRegistrationsNumber() < 2)
            ? TournamentStatus.CANCELLED
            : TournamentStatus.REGISTRATION_CLOSED;
        }
        yield status;
      }
      // cancel tournament if it's not planned and the startDate arrives
      case REGISTRATION_CLOSED -> (!t.getStartDate().isAfter(today))
        ? TournamentStatus.CANCELLED
        : status;
      // start tournament if its planned and startDate arrives
      case PLANNED -> (!t.getStartDate().isAfter(today))
        ? TournamentStatus.IN_PROGRESS
        : status;
      // finish tournament if endDate arrives
      case IN_PROGRESS -> (!t.getEndDate().isAfter(today))
        ? TournamentStatus.DONE
        : status;
      default -> status;
    };
  }

  /**
   * Get all tournaments optionally filtered by timeframe, teams or members.
   *
   * @param statuses a list of specific statuses to filter by
   * @param teamsIds a list of specific team ids
   * @param membersIds a list of specific member ids whose team will be used
   * @param search a search string to filter tournaments by name
   * @return the filtered and sorted list of tournaments.
   */
  public Iterable<TournamentSummaryDto> getTournaments(List<TournamentStatus> statuses,
      List<Long> teamsIds, List<Long> membersIds, String search, LocalDate minDate,
      LocalDate maxDate) {
    Specification<Tournament> spec = Specification.where(null);

    spec = spec.and(TournamentSpecifications.hasStatuses(statuses))
        .and(TournamentSpecifications.searchByName(search))
        .and(TournamentSpecifications.isBetweenDates(minDate, maxDate))
        .and(TournamentSpecifications.hasTeams(teamsIds))
        .and(TournamentSpecifications.hasMembersInMatches(membersIds));

    Sort sort = Sort.by(Sort.Direction.DESC, "startDate");
    List<Tournament> filteredTournaments = tournamentRepository.findAll(spec, sort);

    return filteredTournaments.stream().map(this::mapToSummaryDto).toList();
  }

  /**
   * Maps a tournament to a summary DTO.
   *
   * @param t the tournament to map
   * @return the tournament summary DTO
   */
  private TournamentSummaryDto mapToSummaryDto(Tournament t) {
    return new TournamentSummaryDto(t.getIdTournament(), t.getName(), t.getDescription(),
        t.getStartDate(), t.getEndDate(), t.getRegistrationDeadline(), t.getStatus(),
        t.getCapacity(), t.getRegistrationsNumber());
  }

  /**
   * Update a tournament's information.
   *
   * @param tournamentId the id of the tournament to update
   * @param newTournament the tournament with the updated data
   * @param currentMember the current member
   * @return the updated tournament if it has been updated, null otherwise.
   */
  public Tournament updateTournament(Long tournamentId, NewTournament newTournament,
      Member currentMember) {
    if (!currentMember.isAdmin()) {
      return null;
    }

    Tournament tournament = tournamentRepository.findById(tournamentId).orElse(null);

    if (tournament == null) {
      return null;
    }

    if (tournament.getStatus() != TournamentStatus.IN_PREPARATION) {
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
      tournament.setCapacity(newTournament.capacity());
    }

    if (newTournament.registrationDeadline() != null) {
      tournament.setRegistrationDeadline(newTournament.registrationDeadline());
    }
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
    Tournament tournament =
        doesTournamentExistInTheGivenStatus(tournamentId, TournamentStatus.IN_PREPARATION);

    if (tournament == null) {
      return null;
    }

    if (!currentMember.isAdmin()) {
      return null;
    }

    tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);

    tournamentRepository.save(tournament);
    notificationService.notifyAllMembers(
        "Nouveau Tournoi ! " + tournament.getName() + " vient d'ouvrir ses portes.",
        NotificationType.TOURNAMENT, tournamentId);

    return tournament;
  }

  /**
   * Checks if a tournament exists and has the given status.
   *
   * @param tournamentId the tournament id
   * @param status the status to check
   * @return the tournament if it exists and has the given status, null otherwise
   */
  private Tournament doesTournamentExistInTheGivenStatus(Long tournamentId,
      TournamentStatus status) {
    Tournament tournament = tournamentRepository.findById(tournamentId).orElse(null);

    if (tournament == null) {
      return null;
    }

    if (tournament.getStatus() != status) {
      return null;
    }

    return tournament;
  }

  /**
   * Register a team to a tournament.
   *
   * @param idTournament the tournament id
   * @param currentMember the member requesting to register the team
   */
  @Transactional
  public TournamentDetailsDto registerTeam(Long idTournament, Member currentMember) {
    // Reload member within the transactional session to avoid LazyInitializationException
    Member member = memberRepository.findById(currentMember.getIdMember()).orElse(null);
    if (member == null) {
      throw new InactiveTeamException("User not found");
    }

    Team team = member.getTeam();
    if (team == null || !team.getIsActive()) {
      throw new InactiveTeamException("User is not in an active team");
    }

    if (!teamService.isManager(team, member)) {
      throw new NotManagerException("Only a team manager can register the team");
    }

    if (team.getMembers().size() < 4) {
      throw new InsufficientTeamMembersException("Team must have at least 4 members to register");
    }

    Tournament tournament = tournamentRepository.findById(idTournament)
        .orElseThrow(() -> new TournamentNotFoundException("Tournament not found"));

    if (team.getTournaments().contains(tournament)) {
      throw new DuplicateRegistrationException("Team is already registered for this tournament");
    }

    if (!tournament.registerTeam(team)) {
      throw new RegistrationClosedException("Registration closed or deadline passed");
    }

    tournamentRepository.save(tournament);
    return getTournamentDetails(idTournament);
  }

  /**
   * Generate matches for a tournament.
   *
   * @param tournamentId the ID of the tournament
   */
  @Transactional
  public void generateMatches(Long tournamentId) {
    Tournament tournament = fetchAndValidateTournament(tournamentId);

    List<Match> generatedMatches = BracketGenerator.generateBracket(tournament.getTeams());

    scheduleMatches(generatedMatches, tournament);

    List<Match> savedMatches = matchRepository.saveAll(generatedMatches);

    generateAndSaveDefaultLineups(savedMatches);

    tournament.setStatus(TournamentStatus.IN_PROGRESS);
    tournamentRepository.save(tournament);
  }

  /**
   * Fetch and validate a tournament by its ID.
   *
   * @param tournamentId the ID of the tournament
   * @return the tournament
   */
  private Tournament fetchAndValidateTournament(Long tournamentId) {
    Tournament tournament = tournamentRepository.findById(tournamentId)
        .orElseThrow(() -> new TournamentNotFoundException("Tournament not found"));

    if (tournament.getStatus() != TournamentStatus.REGISTRATION_CLOSED) {
      throw new TournamentNotInRegistrationClosedException(
          "Matches can only be generated for a registration-closed tournament");
    }
    return tournament;
  }

  /**
   * Schedule matches for a tournament.
   *
   * @param matches the matches to schedule
   * @param tournament the tournament
   */
  private void scheduleMatches(List<Match> matches, Tournament tournament) {
    final int matchDurationMins = 45;
    final int bufferMins = 15;
    final int maxConcurrentMatches = 10;

    matches.sort(Comparator.comparingInt(Match::getTurn));

    LocalDateTime currentTimeCursor = tournament.getStartDate().atTime(10, 0);
    int currentRound = 1;
    int matchesInCurrentWave = 0;

    for (Match match : matches) {
      // Move to next round
      if (match.getTurn() > currentRound) {
        currentRound = match.getTurn();
        currentTimeCursor = currentTimeCursor.plusMinutes(matchDurationMins + bufferMins);
        matchesInCurrentWave = 0;
      }

      // Move to next wave if current servers are full
      if (matchesInCurrentWave >= maxConcurrentMatches) {
        currentTimeCursor = currentTimeCursor.plusMinutes(matchDurationMins + bufferMins);
        matchesInCurrentWave = 0;
      }

      match.setDateHour(currentTimeCursor);
      match.setTournament(tournament);
      match.setStatus(MatchStatus.PLANNED);

      matchesInCurrentWave++;
    }
    
    LocalDateTime actualFinishTime = currentTimeCursor.plusMinutes(matchDurationMins);

    // Fail-fast validation
    if (actualFinishTime.isAfter(tournament.getEndDate().atTime(10, 0))) {
      throw new ImpossibleTournamentException("Tournament is physically impossible to complete! "
          + "You need more concurrent servers or a later end date. " + "Estimated finish: "
          + actualFinishTime);
    }
  }

  /**
   * Generate and save default lineups for a list of matches.
   *
   * @param savedMatches the saved matches
   */
  private void generateAndSaveDefaultLineups(List<Match> savedMatches) {
    List<MatchLineup> defaultLineups = new ArrayList<>();

    for (Match match : savedMatches) {
      if (match.getTeam1() != null) {
        defaultLineups.add(createDefaultLineup(match, match.getTeam1()));
      }
      if (match.getTeam2() != null) {
        defaultLineups.add(createDefaultLineup(match, match.getTeam2()));
      }
    }

    matchLineupRepository.saveAll(defaultLineups);
  }

  /**
   * Create a default lineup for a match and team.
   *
   * @param match the match
   * @param team the team
   * @return the default lineup
   */
  private MatchLineup createDefaultLineup(Match match, Team team) {
    MatchLineup lineup = new MatchLineup();
    lineup.setMatch(match);
    lineup.setTeam(team);
    lineup.setScore(0);
    lineup.setWinner(false);
    lineup.setHasForfeited(false);

    return lineup;
  }
}
