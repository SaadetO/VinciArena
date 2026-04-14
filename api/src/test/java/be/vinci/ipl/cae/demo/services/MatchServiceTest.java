package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchResultConfirmation;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MatchResultConfirmationRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
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

}
