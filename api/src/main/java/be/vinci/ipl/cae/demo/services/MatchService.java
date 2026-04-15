package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.AlreadyConfirmedException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberHasNoTeamException;
import be.vinci.ipl.cae.demo.exceptions.ResultNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UserNotInMatchException;
import be.vinci.ipl.cae.demo.models.entities.Match;
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
  public MatchService(MatchRepository matchRepository,
      TeamRepository teamRepository,
      MemberRepository memberRepository,
      TournamentRepository tournamentRepository,
      MatchLineupRepository matchLineupRepository,
      MatchResultConfirmationRepository matchResultConfirmation) {
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
   * @param match the match
   * @param member the member
   * @throws MemberHasNoTeamException if the user has no team
   * @throws UserNotInMatchException if the user is not part of the match
   */
  private void validateUserCanConfirm(Match match, Member member) {

    if (member.getTeam() == null) {
      throw new MemberHasNoTeamException("User has no team");
    }

    Long teamId = member.getTeam().getIdTeam();

    boolean isTeam1 = match.getTeam1() != null
        && match.getTeam1().getIdTeam().equals(teamId);

    boolean isTeam2 = match.getTeam2() != null
        && match.getTeam2().getIdTeam().equals(teamId);

    if (!isTeam1 && !isTeam2) {
      throw new UserNotInMatchException("User not part of this match");
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
   * Updates the contestation for the correct team.
   *
   * @param match the match
   * @param member the member
   * @param confirmation the confirmation entity
   */
  private void updateContest(Match match, Member member,
      MatchResultConfirmation confirmation) {

    Long teamId = member.getTeam().getIdTeam();

    boolean isTeam1 = match.getTeam1() != null
        && match.getTeam1().getIdTeam().equals(teamId);

    if (isTeam1) {

      if (confirmation.getConfirmationTeam1() != null) {
        throw new AlreadyConfirmedException("Already confirmed or contested");
      }

      confirmation.setConfirmationTeam1(false);

    } else {

      if (confirmation.getConfirmationTeam2() != null) {
        throw new AlreadyConfirmedException("Already confirmed or contested");
      }

      confirmation.setConfirmationTeam2(false);
    }
  }


}
