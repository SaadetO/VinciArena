package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ForbiddenException;
import be.vinci.ipl.cae.demo.exceptions.MatchLineupNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotInTeamException;
import be.vinci.ipl.cae.demo.exceptions.MemberUnavailableException;
import be.vinci.ipl.cae.demo.models.dtos.MatchLineupDto;
import be.vinci.ipl.cae.demo.models.dtos.NewMatchLineupDto;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class MatchLineupService {
  private final MatchRepository matchRepository;
  private final MatchLineupRepository matchLineupRepository;
  private final MemberRepository memberRepository;
  private final MemberService memberService;

  public MatchLineupService(MatchRepository matchRepository,
      MatchLineupRepository matchLineupRepository,
      MemberRepository memberRepository,
      MemberService memberService) {
    this.matchRepository = matchRepository;
    this.matchLineupRepository = matchLineupRepository;
    this.memberRepository = memberRepository;
    this.memberService = memberService;
  }


  public MatchLineupDto updateLineup(NewMatchLineupDto newLineup, Long matchId,
      Member currentMember) {
    Set<Member> membersSet = validateMatchLineup(newLineup, matchId, currentMember);
    Match match = matchRepository.getMatchByIdMatch(matchId);
    Team team = currentMember.getTeam();
    MatchLineup matchLineup = matchLineupRepository.findByMatchAndTeam(match, team)
        .orElseThrow(MatchLineupNotFoundException::new);
    matchLineup.replaceLineup(membersSet);
    return MatchLineupDto.fromEntity(matchLineup);
  }

  private Set<Member> validateMatchLineup(NewMatchLineupDto newLineup, Long matchId,
      Member currentMember) {
    Match match = matchRepository.getMatchByIdMatch(matchId);
    if (match == null) {
      throw new MatchNotFoundException("Match " + matchId + " not found.");
    }
    // if not manager of one of the teams in the match
    if (!memberService.isManagerOfTeam(currentMember, match.getTeam1())
        && !memberService.isManagerOfTeam(currentMember, match.getTeam2())) {
      throw new ForbiddenException("You are not a manager for either team in this match.");
    }
    Team team = currentMember.getTeam();
    Set<Member> memberSet = new HashSet<>();
    // check members are in this team
    for (Long id : newLineup.playerIds()) {
      // check member exists
      Member member = memberRepository.findById(id).orElse(null);
      if (member == null) {
        throw new MemberNotFoundException("Member with " + id + " does not exist");
      }
      // check member is part of team
      if (!memberService.isMemberOfTeam(id, team)) {
        throw new MemberNotInTeamException();
      }
      // check member is available in this date
      if (!memberService.isMemberFreeAt(member, match.getDateHour())) {
        throw new MemberUnavailableException();
      }
      memberSet.add(member);
    }
    return memberSet;

  }

}
