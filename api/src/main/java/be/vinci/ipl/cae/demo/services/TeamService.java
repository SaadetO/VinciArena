package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.dtos.TeamDetailsDto;
import be.vinci.ipl.cae.demo.models.dtos.UserSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Team service.
 */
@Service
public class TeamService {

  private final TeamRepository teamRepository;
  private final MemberRepository memberRepository;
  private final JoinRequestRepository joinRequestRepository;
  private final MemberService memberService;

  /**
   * Constructor.
   *
   * @param teamRepository        the team repository
   * @param memberRepository      the member repository
   * @param joinRequestRepository the join-request repository
   * @param memberService         the member service
   */
  public TeamService(TeamRepository teamRepository, MemberRepository memberRepository,
      JoinRequestRepository joinRequestRepository, MemberService memberService) {
    this.teamRepository = teamRepository;
    this.memberRepository = memberRepository;
    this.joinRequestRepository = joinRequestRepository;
    this.memberService = memberService;
  }

  /**
   * Get team details.
   *
   * @param id            the team ID
   * @param currentMember the current member
   * @return the team details; joinRequests is null if currentMember is not a team manager
   */
  public TeamDetailsDto getTeamDetails(Long id, Member currentMember) {
    Team team = teamRepository.findById(id).orElse(null);
    if (team == null) {
      return null;
    }



    List<UserSummaryDto> managers = new ArrayList<>();
    if (team.getManager1() != null) {
      managers.add(memberService.getUserSummary(team.getManager1()));
    }
    if (team.getManager2() != null) {
      managers.add(memberService.getUserSummary(team.getManager2()));
    }

    List<UserSummaryDto> members = team.getMembers().stream()
        .map(memberService::getUserSummary)
        .collect(Collectors.toList());

    List<JoinRequestDto> joinRequests = null;

    if (currentMember != null && isManager(team, currentMember)) {
      joinRequests = joinRequestRepository.findAllByRequestedTeamAndStatus(team,
              RequestStatus.PENDING)
          .stream()
          .map(jr -> JoinRequestDto.builder()
              .idJoinRequest(jr.getIdJoinRequest())
              .idTeam(jr.getRequestedTeam().getIdTeam())
              .teamName(jr.getRequestedTeam().getName())
              .status(jr.getStatus())
              .expirationDate(jr.getExpirationDate())
              .requester(memberService.getUserSummary(jr.getMember()))
              .build())
          .collect(Collectors.toList());
    }

    return TeamDetailsDto.builder()
        .idTeam(team.getIdTeam())
        .name(team.getName())
        .isActive(team.getIsActive())
        .managers(managers)
        .members(members)
        .joinRequests(joinRequests)
        .build();
  }

  /**
   * Create a new team. The creator becomes manager1 of the team.
   *
   * @param teamName the name for the new team
   * @param creator  the member creating the team
   * @return the created team, or null
   */
  @Transactional
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

    // Invalidate pending join requests as the creator is now in a team
    joinRequestRepository.deleteAllByMemberAndStatus(creator, RequestStatus.PENDING);

    return team;
  }

  /**
   * Check if member is a manager of a given team.
   *
   * @param team   the given team
   * @param member the member to check for manager status
   * @return true is member is a manager; false otherwise
   */
  public boolean isManager(Team team, Member member) {
    return team.getManager1() != null && team.getManager1().getIdMember()
        .equals(member.getIdMember())
        || (team.getManager2() != null && team.getManager2().getIdMember()
        .equals(member.getIdMember()));
  }

  /**
   * Get all active teams.
   *
   * @return an iterable containing all active teams
   */
  public Iterable<Team> getAllActiveTeams() {
    return teamRepository.findByIsActiveTrue();
  }

  /**
   * Designate a member as a manager of a team.
   *
   * @param teamId        the team ID
   * @param memberId      the member ID to designate
   * @param currentMember the authenticated member
   * @return the updated team, or null if unauthorized, team/member not found, or no spots left
   */
  @Transactional
  public Team designateSecondManager(Long teamId, Long memberId, Member currentMember) {
    Team team = teamRepository.findById(teamId).orElse(null);
    if (team == null) {
      return null;
    }

    // Check if currentMember is a manager
    boolean isManager = isManager(team, currentMember);
    if (!isManager) {
      return null;
    }

    Member memberToDesignate = memberRepository.findById(memberId).orElse(null);
    if (memberToDesignate == null) {
      return null;
    }

    // Check if member belongs to the team
    if (memberToDesignate.getTeam() == null || !memberToDesignate.getTeam().getIdTeam()
        .equals(teamId)) {
      return null;
    }

    // Check if member is already a manager
    if ((team.getManager1() != null && team.getManager1().getIdMember().equals(memberId))
        || (team.getManager2() != null && team.getManager2().getIdMember().equals(memberId))) {
      return team; // Already a manager
    }

    // Check for open spots
    if (team.getManager1() == null) {
      team.setManager1(memberToDesignate);
    } else if (team.getManager2() == null) {
      team.setManager2(memberToDesignate);
    } else {
      return null; // Both spots taken
    }

    return teamRepository.save(team);
  }

  /**
   * Remove the current member from their team. Promotes manager2 to manager1 if manager1 leaves, or
   * deactivates the team if it's the last manager.
   *
   * @param currentMember the member leaving the team
   * @return the updated team, or null if member is not in a team
   */
  @Transactional
  public Team quitTeam(Member currentMember) {
    if (currentMember.getTeam() == null) {
      return null;
    }

    Team team = currentMember.getTeam();

    if (
        team.getManager1() != null
            && team.getManager1().getIdMember().equals(currentMember.getIdMember())
    ) {
      team.setManager1(null);
    } else if (team.getManager2() != null && team.getManager2().getIdMember()
        .equals(currentMember.getIdMember())) {
      team.setManager2(null);
    }

    if (team.getManager1() == null && team.getManager2() == null) {
      team.setIsActive(false);
    }

    currentMember.setTeam(null);
    memberRepository.save(currentMember);

    return teamRepository.save(team);
  }
}
