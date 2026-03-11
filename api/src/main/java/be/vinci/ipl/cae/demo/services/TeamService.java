package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import org.springframework.stereotype.Service;

/**
 * Team service.
 */
@Service
public class TeamService {

  private final TeamRepository teamRepository;
  private final MemberRepository memberRepository;

  /**
   * Constructor.
   *
   * @param teamRepository   the team repository
   * @param memberRepository the member repository
   */
  public TeamService(TeamRepository teamRepository, MemberRepository memberRepository) {
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Create a new team. The creator becomes manager1 of the team.
   *
   * @param teamName the name for the new team
   * @param creator  the member creating the team
   * @return the created team, or null if the name is already taken
   *         or the creator already belongs to a team
   */
  public Team createTeam(String teamName, Member creator) {
    if (teamRepository.existsByName(teamName)) {
      return null;
    }

    if (creator.getTeam() != null) {
      return null;
    }

    Team team = new Team();
    team.setName(teamName);
    team.setIsActive(true);
    team.setManager1(creator);

    team = teamRepository.save(team);

    creator.setTeam(team);
    memberRepository.save(creator);

    return team;
  }

  /**
   * Get all active teams.
   *
   * @return an iterable containing all active teams
   */
  public Iterable<Team> getAllActiveTeams() {
    return teamRepository.findByIsActiveTrue();
  }
}
