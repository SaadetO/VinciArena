package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.MatchNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.MatchNotPlayedException;
import be.vinci.ipl.cae.demo.exceptions.TeamNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.TeamNotInMatchException;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
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

  /**
   * Constructor.
   *
   * @param matchRepository the match repository
   * @param teamRepository the team repository
   * @param memberRepository the member repository
   * @param tournamentRepository the tournament repository
   */
  public MatchService(MatchRepository matchRepository, TeamRepository teamRepository,
      MemberRepository memberRepository, TournamentRepository tournamentRepository) {
    this.matchRepository = matchRepository;
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
    this.tournamentRepository = tournamentRepository;
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
