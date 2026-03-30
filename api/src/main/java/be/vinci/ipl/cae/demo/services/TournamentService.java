package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewTournament;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;


/**
 * Tournament service.
 */
@Service
public class TournamentService {

  private final TournamentRepository tournamentRepository;
  private final MemberRepository memberRepository;
  private final MatchLineupRepository matchLineupRepository;

  /**
   * Constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository,
      MemberRepository memberRepository, MatchLineupRepository matchLineupRepository) {
    this.tournamentRepository = tournamentRepository;
    this.memberRepository = memberRepository;
    this.matchLineupRepository = matchLineupRepository;
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
    tournament.setMaxNbOfTeams(newTournament.nbMaxOfTeams());
    tournament.setEndDate(newTournament.endDate());
    tournament.setStartDate(newTournament.startDate());
    tournament.setRegistrationDeadline(newTournament.registrationDeadline());

    tournament = tournamentRepository.save(tournament);
    return tournament;
  }

  /**
   * Get all tournaments optionally filtered by timeframe, teams or members.
   *
   * @param timeframe  past, future, current, or null/empty for all.
   * @param teamsIds   a list of specific team ids
   * @param membersIds a list of specific member ids whose team will be used
   * @return the filtered and sorted list of tournaments.
   */
  public Iterable<Tournament> getTournaments(String timeframe, List<Long> teamsIds,
      List<Long> membersIds) {
    Set<Long> filteredTeamIds = new HashSet<>();
    if (teamsIds != null && !teamsIds.isEmpty()) {
      filteredTeamIds.addAll(teamsIds);
    }

    Set<Long> tournamentIdsFromMembers = new HashSet<>();
    if (membersIds != null && !membersIds.isEmpty()) {
      Iterable<MatchLineup> matchLineups = matchLineupRepository.findByMembersIdMemberIn(
          membersIds);
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

    if (!hasFilters) {
      return allTournaments;
    }

    // Additional filtering
    List<Tournament> result = new ArrayList<>();
    for (Tournament t : allTournaments) {
      boolean matchMember = tournamentIdsFromMembers.contains(t.getIdTournament());
      boolean matchTeam = false;
      for (Team team : t.getTeams()) {
        if (filteredTeamIds.contains(team.getIdTeam())) {
          matchTeam = true;
          break;
        }
      }

      if (matchTeam || matchMember) {
        result.add(t);
      }
    }

    return result;
  }
}
