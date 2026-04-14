package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
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
      MatchLineupRepository matchLineupRepository) {
    this.matchRepository = matchRepository;
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
    this.tournamentRepository = tournamentRepository;
    this.matchLineupRepository = matchLineupRepository;
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


}
