package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberHasNoTeamException;
import be.vinci.ipl.cae.demo.exceptions.ResultNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UserNotInMatchException;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchSummaryTournamentDto;
import be.vinci.ipl.cae.demo.models.dtos.MatchTeamDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.specifications.MatchSpecifications;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
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
  private final MemberRepository memberRepository;
  private final MemberService memberService;
  private final MatchLineupRepository matchLineupRepository;
  private final MatchResultConfirmationRepository matchResultConfirmationRepository;
  private final TeamService teamService;

  /**
   * Constructor.
   *
<<<<<<< api/src/main/java/be/vinci/ipl/cae/demo/services/MatchService.java
   * @param matchRepository the match repository
   * @param memberRepository the member repository
   * @param matchLineupRepository the match lineup repository
=======
   * @param matchRepository                   the match repository
   * @param memberRepository                  the member repository
   * @param matchLineupRepository             the match lineup repository
>>>>>>> api/src/main/java/be/vinci/ipl/cae/demo/services/MatchService.java
   * @param matchResultConfirmationRepository the match result confirmation repository
   */
  public MatchService(MatchRepository matchRepository, MemberRepository memberRepository,
      MatchLineupRepository matchLineupRepository,
      MemberService memberService,
      MatchResultConfirmationRepository matchResultConfirmationRepository,
      TeamService teamService) {
    this.matchRepository = matchRepository;
    this.memberRepository = memberRepository;
    this.memberService = memberService;
    this.matchLineupRepository = matchLineupRepository;
    this.matchResultConfirmationRepository = matchResultConfirmationRepository;
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
        .orElseThrow(() ->
            new MatchNotFoundException("Match not found"));
  }

  /**
   * Retrieves a member by email.
   *
   * @param email the email of the member
   * @return the member
   */
  private Member getMember(String email) {
    return memberRepository.findByEmail(email);
  }

  /**
   * Retrieves the confirmation of a match result.
   *
   * @param matchId the id of the match
   * @return the confirmation entity
   * @throws ResultNotFoundException if not found
   */
  private MatchResultConfirmation getConfirmation(Long matchId) {
    return matchResultConfirmationRepository.findById(matchId)
        .orElseThrow(() -> new ResultNotFoundException("Result not found"));
  }

  /**
   * Checks if a user is allowed to confirm the result of a match.
   *
   * @param match  the match
   * @param member the member
   * @throws MemberHasNoTeamException if the user has no team
   * @throws UserNotInMatchException  if the user is not part of the match
   */
  private void validateUserCanConfirm(Match match, Member member) {
    if (member.getTeam() == null) {
      throw new MemberHasNoTeamException("User has no team");
    }

    Long teamId = member.getTeam().getIdTeam();

    boolean isTeam1 = match.getTeam1() != null && match.getTeam1().getIdTeam().equals(teamId);

    boolean isTeam2 = match.getTeam2() != null && match.getTeam2().getIdTeam().equals(teamId);

    if (!isTeam1 && !isTeam2) {
      throw new UserNotInMatchException("User not part of this match");
    }
  }

  /**
   * Updates the confirmation status (confirm or contest) for the correct team.
   *
   * @param match        the match
   * @param member       the member
   * @param confirmation the confirmation entity
   * @param status       true for confirm, false for contest
   */
  private void updateConfirmationStatus(Match match, Member member,
      MatchResultConfirmation confirmation, boolean status) {
    Long teamId = member.getTeam().getIdTeam();

    boolean isTeam1 = match.getTeam1() != null && match.getTeam1().getIdTeam().equals(teamId);

    if (isTeam1) {

      if (confirmation.getConfirmationTeam1() != null) {
        throw new AlreadyConfirmedException("Already confirmed or contested");
      }

      confirmation.setConfirmationTeam1(status);
    } else {

      if (confirmation.getConfirmationTeam2() != null) {
        throw new AlreadyConfirmedException("Already confirmed or contested");
      }

      confirmation.setConfirmationTeam2(status);
    }
  }

  private void handleMatchResult(Long matchId, String email, boolean status) {
    Match match = getMatch(matchId);
    Member member = getMember(email);
    MatchResultConfirmation confirmation = getConfirmation(matchId);

    validateUserCanConfirm(match, member);

    updateConfirmationStatus(match, member, confirmation, status);

    matchResultConfirmationRepository.save(confirmation);
  }

  /**
   * Confirms the result of a match for the authenticated user.
   *
   * @param matchId the id of the match
   * @param email   the email of the authenticated user
   */
  public void confirmResult(Long matchId, String email) {
    handleMatchResult(matchId, email, true);
  }

  /**
   * Contests the result of a match for the authenticated user.
   *
   * @param matchId the id of the match
   * @param email   the email of the authenticated user
   */
  public void contestResult(Long matchId, String email) {
    handleMatchResult(matchId, email, false);
  }

  /**
   * Maps a match to a summary dto.
   *
   * @param match      the match
   * @param tournament the tournament
   * @return the summary dto
   */
  public MatchSummaryDto mapMatchToSummaryDto(Match match, Tournament tournament) {
    List<MatchLineup> lineups = matchLineupRepository.findByIdIdMatch(match.getIdMatch());

    MatchTeamDto team1Dto = createMatchTeamDto(match.getTeam1(), lineups);
    MatchTeamDto team2Dto = createMatchTeamDto(match.getTeam2(), lineups);

    Optional<MatchResultConfirmation> confirmation =
        matchResultConfirmationRepository.findById(match.getIdMatch());
    boolean isConfirmed =
        confirmation.isPresent() && Boolean.TRUE.equals(confirmation.get().getConfirmationTeam1())
            && Boolean.TRUE.equals(confirmation.get().getConfirmationTeam2());

    return new MatchSummaryDto(match.getIdMatch(), match.getDateHour(), match.getTurn(),
        match.getStatus(), isConfirmed, team1Dto, team2Dto, new MatchSummaryTournamentDto(
            tournament.getIdTournament(), tournament.getName(), tournament.getStatus()));
  }

  /**
   * Create a match team dto.
   *
   * @param team    the team
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
      return new MatchTeamDto(team.getIdTeam(), team.getName(), null, false, false);
    }

    return new MatchTeamDto(team.getIdTeam(), team.getName(), lineup.getScore(), lineup.isWinner(),
        lineup.isHasForfeited());
  }
}
