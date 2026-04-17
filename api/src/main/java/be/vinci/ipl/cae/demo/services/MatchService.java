package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.LineupNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberHasNoTeamException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotManagerOfTeamException;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryTournamentDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchTeamDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.specifications.MatchSpecifications;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

/**
 * Match service.
 */
@Service
public class MatchService {

  private final MatchRepository matchRepository;
  private final MemberService memberService;
  private final MatchLineupRepository matchLineupRepository;
  private final TeamService teamService;

  /**
   * Constructs a new MatchService with the specified repositories and services.
   *
   * @param matchRepository the match repository
   * @param matchLineupRepository the match lineup repository
   * @param memberService the member service
   * @param teamService the team service
   */
  public MatchService(MatchRepository matchRepository, MatchLineupRepository matchLineupRepository,
      MemberService memberService, TeamService teamService) {
    this.matchRepository = matchRepository;
    this.memberService = memberService;
    this.matchLineupRepository = matchLineupRepository;
    this.teamService = teamService;
  }

  /**
   * Returns the set of team members available at a specific time. Only accessible by managers.
   *
   */
  public Set<Member> getAvailableMembersForMatch(Long matchId, Member currentMember) {
    if (!teamService.isManager(currentMember.getTeam(), currentMember)) {
      throw new ForbiddenException("Not a manager");
    }

    // Extract the date from the match directly
    Match match = getMatch(matchId);

    LocalDateTime dateTime = match.getDateHour();

    // The rest of your logic remains the same
    Team team = currentMember.getTeam();
    Set<Member> availableMembers = new HashSet<>();
    for (Member member : team.getMembers()) {
      if (memberService.isMemberFreeAt(member, dateTime)) {
        availableMembers.add(member);
      }
    }
    return availableMembers;
  }

  /**
   * Retrieves matches for a team and member, filtered by search query.
   *
   * @param teamId the id of the team
   * @param memberId the id of the member
   * @param searchQuery the search query
   * @return the matches
   */
  public List<MatchSummaryDto> getMatches(Long teamId, Long memberId, String searchQuery) {
    Specification<Match> spec = Specification.where(null);

    Sort sort = Sort.by(Sort.Direction.DESC, "dateHour");

    spec =
        spec.and(MatchSpecifications.hasMember(memberId)).and(MatchSpecifications.hasTeam(teamId))
            .and(MatchSpecifications.searchByTeamName(searchQuery));

    return matchRepository.findAll(spec, sort).stream()
        .map(match -> mapMatchToSummaryDto(match, match.getTournament()))
        .collect(Collectors.toList());
  }

  /**
   * Retrieves a match by its id.
   *
   * @param matchId the id of the match
   * @return the match
   * @throws MatchNotFoundException if the match is not found
   */
  private Match getMatch(Long matchId) {
    return matchRepository.findById(matchId)
        .orElseThrow(() -> new MatchNotFoundException("Match not found"));
  }

  /**
   * Validates if a user is allowed to confirm the result of a match.
   *
   * @param match the match
   * @param member the member
   * @throws MemberHasNoTeamException if the user has no team
   * @throws MemberNotManagerOfTeamException if the user is not part of the match
   */
  private void validateUserCanConfirm(Match match, Member member) {
    if (member.getTeam() == null) {
      throw new MemberHasNoTeamException("Member has no team");
    }

    boolean isManagerTeam1 =
        match.getTeam1() != null && teamService.isManager(match.getTeam1(), member);
    boolean isManagerTeam2 =
        match.getTeam2() != null && teamService.isManager(match.getTeam2(), member);

    if (!isManagerTeam1 && !isManagerTeam2) {
      throw new MemberNotManagerOfTeamException("Member not part of this match");
    }
  }

  /**
   * Updates the confirmation status (confirm or contest) for the correct team.
   *
   * @param match the match
   * @param member the member
   * @param confirmation the confirmation entity
   * @param status true for confirm, false for contest
   */
  private void updateConfirmationStatus(Match match, Team team, boolean status) {
    MatchLineup lineup = matchLineupRepository.findByMatchAndTeam(match, team).orElse(null);

    if (lineup == null) {
      throw new LineupNotFoundException("Lineup not found for match and team");
    }

    if (lineup.getHasConfirmedResults() != null) {
      throw new AlreadyConfirmedException("Lineup already confirmed with a different status");
    }

    lineup.setHasConfirmedResults(status);
    matchLineupRepository.save(lineup);
  }

  /**
   * Handles the result of a match for the authenticated user.
   *
   * @param matchId the id of the match
   * @param member the authenticated user
   * @param status true for confirm, false for contest
   */
  private void handleMatchResult(Long matchId, Member member, boolean status) {
    Match match = getMatch(matchId);

    validateUserCanConfirm(match, member);

    updateConfirmationStatus(match, member.getTeam(), status);
  }

  /**
   * Confirms the result of a match for the authenticated user.
   *
   * @param matchId the id of the match
   * @param member the authenticated user
   */
  public void confirmResult(Long matchId, Member member) {
    handleMatchResult(matchId, member, true);
  }

  /**
   * Contests the result of a match for the authenticated user.
   *
   * @param matchId the id of the match
   * @param member the authenticated user
   */
  public void contestResult(Long matchId, Member member) {
    handleMatchResult(matchId, member, false);
  }

  /**
   * Maps a match to a summary dto.
   *
   * @param match the match
   * @param tournament the tournament
   * @return the summary dto
   */
  public MatchSummaryDto mapMatchToSummaryDto(Match match, Tournament tournament) {
    List<MatchLineup> lineups = matchLineupRepository.findByIdIdMatch(match.getIdMatch());

    MatchTeamDto team1Dto = createMatchTeamDto(match.getTeam1(), lineups);
    MatchTeamDto team2Dto = createMatchTeamDto(match.getTeam2(), lineups);

    return new MatchSummaryDto(match.getIdMatch(), match.getDateHour(), match.getTurn(),
        match.getStatus(), team1Dto, team2Dto, new MatchSummaryTournamentDto(
            tournament.getIdTournament(), tournament.getName(), tournament.getStatus()));
  }

  /**
   * Create a match team dto.
   *
   * @param team the team
   * @param lineups the lineups
   * @return the match team dto
   */
  private MatchTeamDto createMatchTeamDto(Team team, List<MatchLineup> lineups) {
    if (team == null) {
      return null;
    }

    MatchLineup lineup = lineups.stream()
        .filter(l -> l.getTeam().getIdTeam().equals(team.getIdTeam())).findFirst().orElse(null);

    if (lineup == null) {
      return new MatchTeamDto(team.getIdTeam(), team.getName(), null, false, false, false);
    }

    return new MatchTeamDto(team.getIdTeam(), team.getName(), lineup.getScore(), lineup.isWinner(),
        lineup.isHasForfeited(), lineup.getHasConfirmedResults());
  }
}
