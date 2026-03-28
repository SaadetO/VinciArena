package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.dtos.UserSummaryDto;
import be.vinci.ipl.cae.demo.models.dtos.TeamDetailsDto;

import be.vinci.ipl.cae.demo.models.entities.JoinRequest;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.JoinRequestRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private JoinRequestRepository joinRequestRepository;

  @Mock
  private MemberService memberService;

  @InjectMocks
  private TeamService teamService;

  private Member creator;

  @BeforeEach
  void setUp() {
    // New Team-less member
    creator = new Member();
    creator.setIdMember(1L);
    creator.setEmail("player@example.com");
    creator.setTeam(null);
  }

  @Test
  void createTeamValid() {
    // Arrange
    when(teamRepository.existsByName("My Team")).thenReturn(false);
    when(teamRepository.save(any(Team.class))).thenAnswer(call -> {
      Team saved = call.getArgument(0);
      saved.setIdTeam(1L);
      return saved;
    });
    when(memberRepository.save(any(Member.class))).thenReturn(creator);

    // Act
    Team result = teamService.createTeam("My Team", creator);

    // Assert
    assertNotNull(result);
    assertEquals("My Team", result.getName());
    assertTrue(result.getIsActive());
    assertEquals(creator, result.getManager1());
    assertEquals(result, creator.getTeam());
    verify(teamRepository).save(any(Team.class));
    verify(memberRepository).save(creator);
  }

  @Test
  void createTeamDuplicateName() {
    // Arrange
    when(teamRepository.existsByName("Taken Name")).thenReturn(true);

    // Act + Assert
    assertThrows(ResponseStatusException.class,
        () -> teamService.createTeam("Taken Name", creator));
    verify(teamRepository, never()).save(any(Team.class));
    verify(memberRepository, never()).save(any(Member.class));
  }

  @Test
  void createTeamMemberAlreadyInTeam() {
    // Arrange
    Team existingTeam = new Team();
    existingTeam.setIdTeam(5L);
    creator.setTeam(existingTeam);

    when(teamRepository.existsByName("New Team")).thenReturn(false);

    // Act + Assert
    assertThrows(ResponseStatusException.class,
        () -> teamService.createTeam("New Team", creator));
    verify(memberRepository, never()).save(any(Member.class));
    verify(teamRepository, never()).save(any(Team.class));
  }

  @Test
  void getAllActiveTeams() {
    // Arrange
    Team team1 = new Team();
    team1.setName("Team 1");
    Team team2 = new Team();
    team2.setName("Team 2");
    Team teamInactive = new Team();
    teamInactive.setIsActive(false);

    when(teamRepository.findByIsActiveTrue()).thenReturn(List.of(team1, team2));

    // Act
    Iterable<Team> result = teamService.getAllActiveTeams();

    // Assert
    assertNotNull(result);
    assertEquals(List.of(team1, team2), result);
    verify(teamRepository).findByIsActiveTrue();
  }

  @Test
  void getTeamDetails_NotFound() {
    when(teamRepository.findById(1L)).thenReturn(Optional.empty());
    assertThrows(ResponseStatusException.class,
        () -> teamService.getTeamDetails(1L, null));
  }

  @Test
  void getTeamDetails_AsRegularMember() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    Member member1 = new Member();
    member1.setIdMember(10L);
    team.setMembers(List.of(member1));

    Member currentMember = new Member();
    currentMember.setIdMember(20L);
    currentMember.setEmail("user@test.com");

    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(memberService.getUserSummary(member1)).thenReturn(
        UserSummaryDto.builder().id(10L).build());

    // Act
    TeamDetailsDto result = teamService.getTeamDetails(1L, currentMember);

    // Assert
    assertNotNull(result);
    assertEquals("Team 1", result.getName());
    assertEquals(1, result.getMembers().size());
    assertNull(result.getJoinRequests()); // Regular members do not see join requests
  }

  @Test
  void getTeamDetails_AsManager() {
    // Arrange
    Team team = new Team();
    team.setIdTeam(1L);
    team.setName("Team 1");
    team.setIsActive(true);
    Member manager = new Member();
    manager.setIdMember(10L);
    manager.setEmail("manager@test.com");
    team.setManager1(manager);
    team.setMembers(List.of());

    JoinRequest jr = new JoinRequest();
    jr.setIdJoinRequest(100L);
    jr.setMember(new Member());
    jr.getMember().setIdMember(30L);
    jr.setRequestedTeam(team);
    jr.setStatus(RequestStatus.PENDING);

    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(memberService.getUserSummary(manager)).thenReturn(
        UserSummaryDto.builder().id(10L).build());
    when(memberService.getUserSummary(jr.getMember())).thenReturn(
        UserSummaryDto.builder().id(30L).build());
    when(joinRequestRepository.findAllByRequestedTeamAndStatus(team, RequestStatus.PENDING))
        .thenReturn(List.of(jr));

    // Act
    TeamDetailsDto result = teamService.getTeamDetails(1L, manager);

    // Assert
    assertNotNull(result);
    assertNotNull(result.getJoinRequests());
    assertEquals(1, result.getJoinRequests().size());
    assertEquals(100L, result.getJoinRequests().getFirst().getIdJoinRequest());
  }
}
