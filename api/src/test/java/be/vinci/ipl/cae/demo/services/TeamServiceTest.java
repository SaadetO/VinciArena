package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private MemberRepository memberRepository;

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

    // Act
    Team result = teamService.createTeam("Taken Name", creator);

    // Assert
    assertNull(result);
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

    // Act
    Team result = teamService.createTeam("New Team", creator);

    // Assert
    assertNull(result);
    verify(memberRepository, never()).save(any(Member.class));
    verify(teamRepository, never()).save(any(Team.class));
  }
}
