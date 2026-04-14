package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class MatchServiceTest {

  @Mock
  private MatchRepository matchRepository;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private MatchResultConfirmationRepository confirmationRepository;

  @InjectMocks
  private MatchService matchService;

  private Match match;
  private Member member;
  private MatchResultConfirmation confirmation;

  @BeforeEach
  void setUp() {
    match = new Match();
    match.setIdMatch(1L);

    Team team1 = new Team();
    team1.setIdTeam(10L);

    Team team2 = new Team();
    team2.setIdTeam(20L);

    match.setTeam1(team1);
    match.setTeam2(team2);

    member = new Member();
    member.setEmail("test@mail.com");

    confirmation = new MatchResultConfirmation();
    confirmation.setId(1L);
  }

  @Test
  void confirmResult_team1_success() {
    // Arrange
    member.setTeam(match.getTeam1());

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findByEmail("test@mail.com")).thenReturn(member);
    when(confirmationRepository.findById(1L)).thenReturn(Optional.of(confirmation));

    // Act
    matchService.confirmResult(1L, "test@mail.com");

    // Assert
    assertTrue(confirmation.getConfirmationTeam1());
    verify(confirmationRepository).save(confirmation);
  }

}
