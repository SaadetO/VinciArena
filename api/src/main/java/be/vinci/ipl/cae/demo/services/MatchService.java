package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotInTeamException;
import be.vinci.ipl.cae.demo.exceptions.MemberUnavailableException;
import be.vinci.ipl.cae.demo.models.dtos.MatchLineupDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.util.Optional;
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
    Team team = currentMember.getTeam();

    if (match == null) {
      // MatchNotFoundException
    }
    // if not manager of one of the teams in the match
    if (memberService.isManagerOfTeam(currentMember, match.getTeam1())
        && memberService.isManagerOfTeam(
        currentMember, match.getTeam2())) {
      throw new ForbiddenException("Cannot choose lineup if you aren't the manager of the team.");
    }
    // check all the members exist

    // check members are in this team
    for (Long id : newLineup.playerIds()) {
      //check member exists
      Member member = memberRepository.findById(id).orElse(null);
      if (member == null) {
        throw new MemberNotFoundException("Member with " + id + " does not exist");
      }
      // check member is part of team
      if (!memberService.isMemberOfTeam(id, team)) {
        throw new MemberNotInTeamException("Member " + id + " is not in " + team.getName());
      }
      // check member is available in this date
      if (!memberService.isMemberFreeAt(member, match.getDateHour())) {
        throw new MemberUnavailableException("Member " + id + " is not available for this date.");
      }
    }

  }
}
