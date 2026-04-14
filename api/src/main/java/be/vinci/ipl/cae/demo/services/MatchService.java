package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.models.dtos.MatchLineupDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
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

  private final MatchRepository matchRepository;
  private final TeamRepository teamRepository;
  private final MemberRepository memberRepository;
  private final TournamentRepository tournamentRepository;
  private final MemberService memberService;

  /**
   * Constructor.
   *
   * @param matchRepository      the match repository
   * @param teamRepository       the team repository
   * @param memberRepository     the member repository
   * @param tournamentRepository the tournament repository
   */
  public MatchService(MatchRepository matchRepository, TeamRepository teamRepository,
      MemberRepository memberRepository, TournamentRepository tournamentRepository,
      MemberService memberService) {
    this.matchRepository = matchRepository;
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
    this.tournamentRepository = tournamentRepository;
    this.memberService = memberService;
  }

  public MatchLineupDto updateLineup(MatchLineupDto newLineup, Long matchId, Member currentMember) {
    //validate
    return null;
  }

  private void validateMatchLineup(MatchLineupDto newLineup, Long matchId, Member currentMember) {
    Match match = matchRepository.getMatchByIdMatch(matchId);
    Long memberId = currentMember.getIdMember();

    if (match == null) {
      // MatchNotFoundException
    }
    // if not manager of one of the teams in the match
    if (memberService.isManagerOfTeam(memberId, match.getTeam1()) && memberService.isManagerOfTeam(
        memberId, match.getTeam2())) {
      throw new ForbiddenException("Cannot choose lineup if you aren't the manager of the team.");
    }




  }
}
