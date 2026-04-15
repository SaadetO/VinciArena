package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.LastManagerCannotQuitException;
import be.vinci.ipl.cae.demo.exceptions.MemberAlreadyManagerException;
import be.vinci.ipl.cae.demo.exceptions.MemberNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.NoManagerSpotsLeftException;
import be.vinci.ipl.cae.demo.exceptions.NotManagerException;
import be.vinci.ipl.cae.demo.exceptions.ReplacementRequiredException;
import be.vinci.ipl.cae.demo.exceptions.TeamNameAlreadyTakenException;
import be.vinci.ipl.cae.demo.exceptions.TeamNotFoundException;
import be.vinci.ipl.cae.demo.exceptions.UserAlreadyInTeamException;
import be.vinci.ipl.cae.demo.exceptions.UserNotInTeamException;
import be.vinci.ipl.cae.demo.models.dtos.FullTeamDto;
import be.vinci.ipl.cae.demo.models.dtos.JoinRequestDto;
import be.vinci.ipl.cae.demo.models.dtos.MemberSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.TeamDetailsDto;
import be.vinci.ipl.cae.demo.models.dtos.UserSummaryDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.specifications.TeamSpecifications;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
   * @param teamRepository the team repository
   * @param memberRepository the member repository
   * @param joinRequestRepository the join-request repository
   * @param memberService the member service
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
   * @param id the team ID
   * @param currentMember the current member
   * @return the team details; joinRequests is null if currentMember is not a team manager
   */
  public TeamDetailsDto getTeamDetails(Long id, Member currentMember) {
    Team team = getExistingTeam(id);

    List<UserSummaryDto> managers = getManagersSummary(team);
    List<UserSummaryDto> members = getMembersSummary(team);
    List<JoinRequestDto> joinRequests = getPendingJoinRequests(team, currentMember);

    return TeamDetailsDto.builder().idTeam(team.getIdTeam()).name(team.getName())
        .isActive(team.getIsActive()).managers(managers).members(members).joinRequests(joinRequests)
        .build();
  }

  /**
   * Create a new team. The creator becomes manager1 of the team.
   *
   * @param teamName the name for the new team
   * @param creator the member creating the team
   * @return the created team, or null
   */
  @Transactional
  public Team createTeam(String teamName, Member creator) {
    if (teamRepository.existsByName(teamName)) {
      throw new TeamNameAlreadyTakenException("Le nom de Team est déjà pris.");
    }

    if (creator.getTeam() != null) {
      throw new UserAlreadyInTeamException(
          "L'utilisateur fait déjà partie d'une équipe");
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
   * @param team the given team
   * @param member the member to check for manager status
   * @return true is member is a manager; false otherwise
   */
  public boolean isManager(Team team, Member member) {
    if (team == null || member == null) {
      return false;
    }
    return isManager1(team, member) || isManager2(team, member);
  }

  /**
   * Check if member is a manager1 of a given team.
   *
   * @param team the given team
   * @param member the member to check for manager1 status
   * @return true is member is a manager1; false otherwise
   */
  public boolean isManager1(Team team, Member member) {
    return team.getManager1() != null
        && team.getManager1().getIdMember().equals(member.getIdMember());
  }

  /**
   * Check if member is a manager2 of a given team.
   *
   * @param team the given team
   * @param member the member to check for manager2 status
   * @return true is member is a manager2; false otherwise
   */
  public boolean isManager2(Team team, Member member) {
    return team.getManager2() != null
        && team.getManager2().getIdMember().equals(member.getIdMember());
  }

  /**
   * Check if the team has another manager than the one given in parameter.
   *
   * @param team the given team
   * @param member one of or the only manager of the team
   * @return true if the team has another manager than the given member, false otherwise.
   */
  public boolean hasOtherManager(Team team, Member member) {
    boolean result = false;

    if (isManager1(team, member)) {
      result = team.getManager2() != null;
    }
    if (isManager2(team, member)) {
      result = team.getManager1() != null;
    }

    return result;
  }

  /**
   * Get all teams with optional filtering by active status and search query.
   *
   * @param isActive the active status
   * @param searchQuery the search query
   * @return a list of teams matching the criteria
   */
  public List<FullTeamDto> getAllTeams(boolean isActive, String searchQuery) {
    Specification<Team> spec = Specification.where(TeamSpecifications.isActive(isActive))
        .and(TeamSpecifications.searchByName(searchQuery));

    Sort sort = Sort.by("name").ascending();
    return teamRepository.findAll(spec, sort).stream().map(this::mapTeamToFullTeamDto).toList();
  }

  /**
   * Map a team entity to a full team DTO.
   *
   * @param team the team entity
   * @return the full team DTO
   */
  public FullTeamDto mapTeamToFullTeamDto(Team team) {
    if (team == null) {
      return null;
    }

    List<MemberSummaryDto> safeMembers = team.getMembers() == null ? Collections.emptyList()
        : team.getMembers().stream().map(memberService::mapMemberToSummary).toList();

    return FullTeamDto.builder().idTeam(team.getIdTeam()).name(team.getName())
        .isActive(team.getIsActive())
        .managerId1(team.getManager1() != null ? team.getManager1().getIdMember() : null)
        .managerId2(team.getManager2() != null ? team.getManager2().getIdMember() : null)
        .members(safeMembers).build();
  }

  /**
   * Designate a member as a manager of a team.
   *
   * @param teamId the team ID
   * @param memberId the member ID to designate
   * @param currentMember the authenticated member
   * @return the updated team, or null if unauthorized, team/member not found, or no spots left
   */
  @Transactional
  public Team designateSecondManager(Long teamId, Long memberId, Member currentMember) {
    Team team = getExistingTeam(teamId);
    requireManager(team, currentMember);

    Member memberToDesignate = getExistingMember(memberId);
    requireTeamMembership(memberToDesignate, teamId);

    // Check if member is already a manager
    if (isManager(team, memberToDesignate)) {
      return team; // Already a manager
    }

    // Check for open spots
    if (team.getManager1() == null) {
      team.setManager1(memberToDesignate);
    } else if (team.getManager2() == null) {
      team.setManager2(memberToDesignate);
    } else {
      throw new NoManagerSpotsLeftException(
          "Il n'y a plus de place de responsable libre dans l'équipe."); // Both spots taken
    }

    return teamRepository.save(team);
  }

  /**
   * Remove the current member from their team. Promotes manager2 to manager1 if manager1 leaves, or
   * deactivates the team if it's the last manager.
   *
   * @param currentMember the member leaving the team
   */
  @Transactional
  public void quitTeam(Member currentMember) {
    if (currentMember.getTeam() == null) {
      throw new UserNotInTeamException(
          "L'utilisateur ne fait pas partie de la Team.");
    }

    Team team = getExistingTeam(currentMember.getTeam().getIdTeam());

    if (isManager1(team, currentMember)) {
      if (team.getManager2() != null) {
        team.setManager1(team.getManager2());
        team.setManager2(null);
      } else if (1 < team.getMembers().size()) {
        throw new LastManagerCannotQuitException(
            "Member cannot quit team as the last manager.");
      } else {
        team.setManager1(null);
      }
    } else if (isManager2(team, currentMember)) {
      team.setManager2(null);
    }

    if (team.getManager1() == null && team.getManager2() == null) {
      team.setIsActive(false);
    }

    currentMember.setTeam(null);
    memberRepository.save(currentMember);

    teamRepository.save(team);
  }

  /**
   * Allow a manager to resign from their role, optionally designating a replacement.
   *
   * @param teamId the team ID
   * @param currentMember the manager who wants to resign
   * @param replacementId the ID of the replacement member (required if no other manager remains)
   * @return the updated team
   */
  @Transactional
  public Team resignManager(Long teamId, Member currentMember, Long replacementId) {
    Team team = getExistingTeam(teamId);
    requireManager(team, currentMember);

    boolean isManager1 = isManager1(team, currentMember);
    boolean hasOtherManager = hasOtherManager(team, currentMember);

    if (!hasOtherManager && replacementId == null) {
      throw new ReplacementRequiredException(
          "Un remplaçant est obligatoire pour quitter le rôle de responsable.");
    }

    if (replacementId != null) {
      Member replacement = getExistingMember(replacementId);
      requireTeamMembership(replacement, teamId);

      if (isManager(team, replacement)) {
        throw new MemberAlreadyManagerException("Ce membre est déjà responsable.");
      }

      if (isManager1) {
        team.setManager1(replacement);
      } else {
        team.setManager2(replacement);
      }
    } else {
      // Normally, a team's manager1 should never be null if the team is active.
      // (manager2 takes manager1 place, and manager2 is set to null)
      // See attribute "manager1" in Team model
      if (isManager1) {
        team.setManager1(null);
      } else {
        team.setManager2(null);
      }
    }

    return teamRepository.save(team);
  }

  /**
   * Retrieves an existing team or throws an exception.
   *
   * @param teamId the team ID
   * @return the team
   * @throws TeamNotFoundException if the team does not exist
   */
  private Team getExistingTeam(Long teamId) {
    return teamRepository.findById(teamId).orElseThrow(
        () -> new TeamNotFoundException("La team n'existe pas ou n'est plus active."));
  }

  /**
   * Validates that the member is a manager of the team.
   *
   * @param team the team
   * @param member the member
   * @throws NotManagerException if the member is not a manager
   */
  private void requireManager(Team team, Member member) {
    if (!isManager(team, member)) {
      throw new NotManagerException("L'utilisateur n'a pas les droits de responsable.");
    }
  }

  /**
   * Retrieves an existing member or throws an exception.
   *
   * @param memberId the member ID
   * @return the member
   * @throws MemberNotFoundException if the member does not exist
   */
  private Member getExistingMember(Long memberId) {
    return memberRepository.findById(memberId).orElseThrow(
        () -> new MemberNotFoundException("L'utilisateur n'existe pas."));
  }

  /**
   * Validates that a member belongs to a specific team.
   *
   * @param member the member
   * @param teamId the team ID
   * @throws UserNotInTeamException if the member is not in the team
   */
  private void requireTeamMembership(Member member, Long teamId) {
    if (member.getTeam() == null || !member.getTeam().getIdTeam().equals(teamId)) {
      throw new UserNotInTeamException("L'utilisateur ne fait pas partie de la Team.");
    }
  }

  private List<UserSummaryDto> getManagersSummary(Team team) {
    List<UserSummaryDto> managers = new ArrayList<>();
    if (team.getManager1() != null) {
      managers.add(memberService.getUserSummary(team.getManager1()));
    }
    if (team.getManager2() != null) {
      managers.add(memberService.getUserSummary(team.getManager2()));
    }
    return managers;
  }

  private List<UserSummaryDto> getMembersSummary(Team team) {
    return team.getMembers().stream().filter(member -> !member.isDeleted())
        .map(memberService::getUserSummary).collect(Collectors.toList());
  }

  private List<JoinRequestDto> getPendingJoinRequests(Team team, Member currentMember) {
    if (currentMember == null || !isManager(team, currentMember)) {
      return null;
    }
    return joinRequestRepository
        .findAllByRequestedTeamAndStatus(team, RequestStatus.PENDING).stream()
        .map(jr -> JoinRequestDto.builder().idJoinRequest(jr.getIdJoinRequest())
            .idTeam(jr.getRequestedTeam().getIdTeam()).teamName(jr.getRequestedTeam().getName())
            .status(jr.getStatus()).expirationDate(jr.getExpirationDate())
            .requester(memberService.getUserSummary(jr.getMember())).build())
        .collect(Collectors.toList());
  }
}

