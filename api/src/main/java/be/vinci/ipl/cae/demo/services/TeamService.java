package be.vinci.ipl.cae.demo.services;

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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    Team team = teamRepository.findById(id).orElse(null);
    if (team == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "La team n'existe pas ou n'est plus active.");
    }

    List<UserSummaryDto> managers = new ArrayList<>();
    if (team.getManager1() != null) {
      managers.add(memberService.getUserSummary(team.getManager1()));
    }
    if (team.getManager2() != null) {
      managers.add(memberService.getUserSummary(team.getManager2()));
    }

    List<UserSummaryDto> members = team.getMembers().stream().filter(member -> !member.isDeleted())
        .map(memberService::getUserSummary).collect(Collectors.toList());

    List<JoinRequestDto> joinRequests = null;

    if (currentMember != null && isManager(team, currentMember)) {
      joinRequests = joinRequestRepository
          .findAllByRequestedTeamAndStatus(team, RequestStatus.PENDING).stream()
          .map(jr -> JoinRequestDto.builder().idJoinRequest(jr.getIdJoinRequest())
              .idTeam(jr.getRequestedTeam().getIdTeam()).teamName(jr.getRequestedTeam().getName())
              .status(jr.getStatus()).expirationDate(jr.getExpirationDate())
              .requester(memberService.getUserSummary(jr.getMember())).build())
          .collect(Collectors.toList());
    }

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
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Le nom de Team est déjà pris.");
    }

    if (creator.getTeam() != null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
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

    return teamRepository.findAll(spec).stream().map(this::mapTeamToFullTeamDto).toList();
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
    Team team = teamRepository.findById(teamId).orElse(null);
    if (team == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "La team n'existe pas ou n'est plus active.");
    }

    // Check if currentMember is a manager
    boolean isManager = isManager(team, currentMember);
    if (!isManager) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "L'utilisateur n'a pas les droits de responsable.");
    }

    Member memberToDesignate = memberRepository.findById(memberId).orElse(null);
    if (memberToDesignate == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "L'utilisateur n'existe pas.");
    }

    // Check if member belongs to the team
    if (memberToDesignate.getTeam() == null
        || !memberToDesignate.getTeam().getIdTeam().equals(teamId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "L'utilisateur ne fait pas partie de la Team.");
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
      throw new ResponseStatusException(HttpStatus.CONFLICT,
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
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "L'utilisateur ne fait pas partie de la Team.");
    }

    Team team = teamRepository.findById(currentMember.getTeam().getIdTeam())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

    if (isManager1(team, currentMember)) {
      if (team.getManager2() != null) {
        team.setManager1(team.getManager2());
        team.setManager2(null);
      } else if (1 < team.getMembers().size()) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
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
    Team team = teamRepository.findById(teamId).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La team n'existe pas."));

    // Vérifier que c’est bien un manager
    if (!isManager(team, currentMember)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "L'utilisateur n'est pas responsable de cette team.");
    }

    boolean isManager1 = isManager1(team, currentMember);
    // boolean isManager2 = isManager2(team, currentMember);

    boolean hasOtherManager = hasOtherManager(team, currentMember);

    if (!hasOtherManager && replacementId == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Un remplaçant est obligatoire pour quitter le rôle de responsable.");
    }

    if (replacementId != null) {
      Member replacement = memberRepository.findById(replacementId).orElseThrow(
          () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Le remplaçant n'existe pas."));

      if (replacement.getTeam() == null || !replacement.getTeam().getIdTeam().equals(teamId)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Le remplaçant doit appartenir à la team.");
      }

      if (isManager(team, replacement)) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce membre est déjà responsable.");
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
}
