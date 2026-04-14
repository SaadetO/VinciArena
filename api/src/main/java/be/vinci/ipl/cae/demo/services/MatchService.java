package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotPlayedException;
import be.vinci.ipl.cae.demo.exceptions.TeamNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.TeamNotInMatchException;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.ResultNotFoundException;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import org.springframework.stereotype.Service;

/**
 * Match service.
 */
@Service
public class MatchService {
  private  final MatchRepository matchRepository;
  private  final TeamRepository teamRepository;
  private final MemberRepository memberRepository;
  private final TournamentRepository tournamentRepository;
  private final MatchLineupRepository matchLineupRepository;
  private final MatchResultConfirmationRepository matchResultConfirmationRepository;

  /**
   * Constructor.
   *
   * @param matchRepository the match repository
   * @param teamRepository the team repository
   * @param memberRepository the member repository
   * @param tournamentRepository the tournament repository
   */
  public MatchService(MatchRepository matchRepository, TeamRepository teamRepository,
      MemberRepository memberRepository, TournamentRepository tournamentRepository,
      MatchLineupRepository matchLineupRepository, MatchResultConfirmationRepository matchResultConfirmation) {
    this.matchRepository = matchRepository;
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
    this.tournamentRepository = tournamentRepository;
    this.matchLineupRepository = matchLineupRepository;
    this.matchResultConfirmationRepository = matchResultConfirmation;
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
   * @param match the match
   * @param member the member
   * @throws ForbiddenException if the user is not part of the match
   */
  private void validateUserCanConfirm(Match match, Member member) {

    if (member.getTeam() == null) {
      throw new ForbiddenException("User has no team");
    }

    Long teamId = member.getTeam().getIdTeam();

    boolean isTeam1 = match.getTeam1() != null
        && match.getTeam1().getIdTeam().equals(teamId);

    boolean isTeam2 = match.getTeam2() != null
        && match.getTeam2().getIdTeam().equals(teamId);

    if (!isTeam1 && !isTeam2) {
      throw new ForbiddenException("User not part of this match");
    }
  }

  /**
   * Updates the confirmation for the correct team.
   *
   * @param match the match
   * @param member the member
   * @param confirmation the confirmation entity
   */
  private void updateConfirmation(Match match, Member member,
      MatchResultConfirmation confirmation) {

    Long teamId = member.getTeam().getIdTeam();

    boolean isTeam1 = match.getTeam1() != null
        && match.getTeam1().getIdTeam().equals(teamId);

    if (isTeam1) {

      if (confirmation.getConfirmationTeam1() != null) {
        throw new AlreadyConfirmedException("Already confirmed or contested");
      }

      confirmation.setConfirmationTeam1(true);

    } else {

      if (confirmation.getConfirmationTeam2() != null) {
        throw new AlreadyConfirmedException("Already confirmed or contested");
      }

      confirmation.setConfirmationTeam2(true);
    }
  }

  /**
   * Confirms the result of a match for the authenticated user.
   *
   * @param matchId the id of the match
   * @param email the email of the authenticated user
   */
  public void confirmResult(Long matchId, String email) {

    Match match = getMatch(matchId);
    Member member = getMember(email);
    MatchResultConfirmation confirmation = getConfirmation(matchId);

    validateUserCanConfirm(match, member);

    updateConfirmation(match, member, confirmation);

    matchResultConfirmationRepository.save(confirmation);
  }

  /**
   * TODO: Description of the methode.
   *
   * @param teamId the team id
   * @param matchId the match id
   * @return true if the team has been declared forfeit for the match, false otherwise.
   * @throws TeamNotFoundException if no team has teamId id
   * @throws MatchNotFoundException if no match has matchId id
   */
  public boolean declareForfeit(Long teamId, Long matchId) {
    Team team = teamRepository.findById(teamId).orElse(null);
    if (team == null) {
      throw new TeamNotFoundException("Team not found");
    }

    Match match = matchRepository.findById(matchId).orElse(null);
    if (match == null) {
      throw new MatchNotFoundException("Match not found");
    }

    boolean isTheTeamPartOfTheMatch = isTheTeamPartOfTheMatch(team, match);

    if (!isTheTeamPartOfTheMatch) {
      throw new TeamNotInMatchException("Team not in match");
    }

    if (!MatchStatus.PLAYED.equals(match.getStatus())) {
      throw new MatchNotPlayedException("Match should have been played before declaring forfeit");
    }

    match.setStatus(MatchStatus.FORFEIT);

    // TODO:
    //  Set the other team as the winner (if they haven't declared forfeit as well ?)
    //    QUESTION: what if the other team also declare forfeit ?
    //  Eliminate the team from the tournament (calling TeamService ?)
    //    QUESTION: which service should be eliminating the team from the tournament ?
    //      (MatchService or TournamentService or TeamService)
    Long tournamentId = match.getTournament().getIdTournament();
    Tournament tournament = tournamentRepository.findById(tournamentId).orElse(null);


    return true;
  }

  /**
   * Check if a team is one of the match's team.
   *
   * @param team the team
   * @param match the match
   * @return true if the team is one of the match's team, false otherwise
   */
  public boolean isTheTeamPartOfTheMatch(Team team, Match match) {
    return team.equals(match.getTeam1()) || team.equals(match.getTeam2());
  }

  /**
   * Check if a team is team1 or team2 of a match.
   *
   * @param team the team
   * @param match the match
   * @return 1 if the team is team1 of the match, 2 if it is team 2, 0 otherwise
   */
  public int getNumberOfTeamInMatch(Team team, Match match) {
    if (team.equals(match.getTeam1())) {
      return 1;
    } else if (team.equals(match.getTeam2())) {
      return 2;
    }
    return 0;
  }
}
