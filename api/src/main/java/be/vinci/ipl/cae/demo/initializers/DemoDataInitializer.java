package be.vinci.ipl.cae.demo.initializers;

import be.vinci.ipl.cae.demo.initializers.InitializerUtils.MemberMockData;
import be.vinci.ipl.cae.demo.initializers.InitializerUtils.TournamentMockData;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MatchRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.StreamSupport;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data initializer for dev.
 */
@Component
@Profile("demo")
public class DemoDataInitializer implements CommandLineRunner {

  private final MemberRepository memberRepo;
  private final TeamRepository teamRepo;
  private final SpecialtyRepository specRepo;
  private final ProfileImageRepository imageRepo;
  private final TournamentRepository tournamentRepo;
  private final MatchRepository matchRepo;
  private final MatchLineupRepository matchLineupRepo;

  /**
   * Demo data Initializer constructor.
   *
   * @param memberRepo      member repository.
   * @param teamRepo        team repository
   * @param specRepo        specialty repository
   * @param imageRepo       image repository
   * @param tournamentRepo  tournament repository
   * @param matchRepo       match repository
   * @param matchLineupRepo matchlineup repository
   */
  public DemoDataInitializer(MemberRepository memberRepo, TeamRepository teamRepo,
      SpecialtyRepository specRepo, ProfileImageRepository imageRepo,
      TournamentRepository tournamentRepo, MatchRepository matchRepo,
      MatchLineupRepository matchLineupRepo) {
    this.memberRepo = memberRepo;
    this.teamRepo = teamRepo;
    this.specRepo = specRepo;
    this.imageRepo = imageRepo;
    this.tournamentRepo = tournamentRepo;
    this.matchRepo = matchRepo;
    this.matchLineupRepo = matchLineupRepo;
  }

  @Override
  public void run(String... args) {
    System.out.println("--- STARTING DEMO DATA INITIALIZATION ---");

    // Create Specialities
    Map<String, Specialty> specMap = InitializerUtils.initializeBasics(specRepo, imageRepo);

    MemberMockData[] memberDataList = {
        new MemberMockData("lea@mail.com", "Lynx", "tacticien", "2025-11-12", true, true,
            "TEAM_ALPHA"),
        new MemberMockData("tom@mail.com", "Rogue", "exécuteur", "2025-12-03", false, false,
            "TEAM_ALPHA"),
        new MemberMockData("ines@mail.com", "Pulse", "guérisseur", "2026-01-18", false, false,
            "TEAM_ALPHA"),
        new MemberMockData("pol@mail.com", "Wolf", "architecte", "2026-02-02", false, false,
            "TEAM_ALPHA"),
        new MemberMockData("tibo@mail.com", "Iron", "gardien", "2025-10-27", true, true,
            "TEAM_OMEGA"),
        new MemberMockData("neo@mail.com", "Shade", "catalyseur", "2025-10-30", false, false,
            "TEAM_OMEGA"),
        new MemberMockData("lisa@mail.com", "Storm", "exécuteur", "2026-01-10", false, true,
            "TEAM_IOTA"),
        new MemberMockData("noa@mail.com", "Flash", "architecte", "2026-02-02", false, true,
            "TEAM_IOTA"),
        new MemberMockData("tim@mail.com", "Titi", "gardien", "2026-02-03", false, false,
            "TEAM_IOTA"),
        new MemberMockData("zoe@mail.com", "Vector", "catalyseur", "2026-02-04", false, false,
            "TEAM_IOTA"),
        new MemberMockData("max@mail.com", "Iron", "gardien", "2026-03-12", false, true,
            "TEAM_DELTA"),
        new MemberMockData("ali@mail.com", "Putsh", "perturbateur", "2026-01-22", false, false,
            "TEAM_DELTA"),
        new MemberMockData("zed@mail.com", "Zero", "architecte", "2025-12-11", true, false,
            "TEAM_DELTA"),
        new MemberMockData("seb@mail.com", "Ice", "guérisseur", "2026-03-01", true, true,
            "TEAM_DELTA"),
        new MemberMockData("oli@mail.com", "Tiger", "tacticien", "2025-11-11", false, false,
            "TEAM_DELTA"),
        new MemberMockData("fin@mail.com", "Final", "exécuteur", "2025-10-22", false, false,
            "TEAM_DELTA")};

    String pw = "Password1!";
    String encodedPw = new BCryptPasswordEncoder().encode(pw);
    Map<String, Team> teamMap = new HashMap<>();

    InitializerUtils.createMembers(memberDataList, encodedPw, specMap, teamMap, memberRepo,
        teamRepo, imageRepo);

    List<Team> ghostTeams = new ArrayList<>();
    for (int i = 1; i <= 15; i++) {
      Team ghost = new Team();
      ghost.setName("TEAM_GHOST_" + i);
      ghost.setIsActive(true);
      ghostTeams.add(teamRepo.save(ghost));
    }

    TournamentMockData[] tournamentDataList = {
        // PASSÉS (DONE)
        new TournamentMockData("Spring Arena Cup 2025",
            "Compétition printanière ouverte aux nouvelles teams émergentes", "2025-04-15",
            "2025-04-25", "2025-04-10T20:00:00", 8, 7, "TEAM_OMEGA", TournamentStatus.DONE),
        new TournamentMockData("Elite Championship 2025",
            "Compétition élite réservée aux meilleures teams", "2025-05-15", "2025-05-30",
            "2025-05-11T20:00:00", 8, 6, "TEAM_IOTA", TournamentStatus.DONE),
        new TournamentMockData("Summer Pro League 2025",
            "Tournoi estival de haut niveau avec les meilleures teams", "2025-07-01", "2025-07-15",
            "2025-06-25T20:00:00", 16, 14, "TEAM_ALPHA", TournamentStatus.DONE),
        new TournamentMockData("Vinci Winter Clash 2026",
            "Tournoi hivernal réunissant des équipes semi-professionnelles", "2026-01-10",
            "2026-01-20", "2026-01-05T20:00:00", 12, 12, "TEAM_DELTA", TournamentStatus.DONE),

        new TournamentMockData("Vinci Easter Cup 2026",
            "Tournoi de Pâques ouvert à toutes les teams actives", "2026-04-15", "2026-04-25",
            "2026-04-08T20:00:00", 8, 7, "TEAM_DELTA", TournamentStatus.DONE),

        new TournamentMockData("Spring Battle Series 2026",
            "Série printanière avec élimination directe et forte participation", "2026-05-04",
            "2026-05-12", "2026-05-01T23:59:59", 8, 8, null, TournamentStatus.IN_PROGRESS)};

    TournamentMockData futureTournamentMock = new TournamentMockData("Elite Championship 2026",
        "Compétition élite réservée aux meilleures teams", "2026-05-15", "2026-05-30",
        "2026-05-11T20:00:00", 10, 9, null, TournamentStatus.REGISTRATION_OPEN);

    for (TournamentMockData data : tournamentDataList) {
      Tournament t = new Tournament();
      t.setName(data.name());
      t.setDescription(data.description());
      t.setStartDate(LocalDate.parse(data.start()));
      t.setEndDate(LocalDate.parse(data.end()));
      t.setRegistrationDeadline(LocalDateTime.parse(data.deadline()));
      t.setCapacity(data.capacity());
      t.setStatus(data.status());
      t.setWinner(teamMap.get(data.winnerTeamName()));
      t.getTeams().add(teamMap.get("TEAM_ALPHA"));
      t.getTeams().add(teamMap.get("TEAM_DELTA"));
      t.getTeams().add(teamMap.get("TEAM_IOTA"));
      t.getTeams().add(teamMap.get("TEAM_OMEGA"));
      InitializerUtils.completeTournamentRegistration(t, ghostTeams, data.teamCount(),
          tournamentRepo);

    }

    Tournament futureTournament = new Tournament();
    futureTournament.setName(futureTournamentMock.name());
    futureTournament.setDescription(futureTournamentMock.description());
    futureTournament.setStartDate(LocalDate.parse(futureTournamentMock.start()));
    futureTournament.setEndDate(LocalDate.parse(futureTournamentMock.end()));
    futureTournament.setRegistrationDeadline(LocalDateTime.parse(futureTournamentMock.deadline()));
    futureTournament.setCapacity(futureTournamentMock.capacity());
    futureTournament.setStatus(futureTournamentMock.status());
    futureTournament.setWinner(teamMap.get(futureTournamentMock.winnerTeamName()));
    futureTournament.getTeams().add(teamMap.get("TEAM_ALPHA"));
    futureTournament.getTeams().add(teamMap.get("TEAM_IOTA"));
    InitializerUtils.completeTournamentRegistration(futureTournament, ghostTeams,
        futureTournamentMock.teamCount(), tournamentRepo);

    // Set up matches for current tournament : SPRING BATTLE SERIES 2026
    Tournament springBattle = StreamSupport.stream(tournamentRepo.findAll().spliterator(), false)
        .filter(t -> "Spring Battle Series 2026".equals(t.getName())).findFirst().orElse(null);

    Team alpha = teamRepo.findByName("TEAM_ALPHA");
    Team omega = teamRepo.findByName("TEAM_OMEGA");
    Team delta = teamRepo.findByName("TEAM_DELTA");
    Team iota = teamRepo.findByName("TEAM_IOTA");
    Team ghost1 = teamRepo.findByName("TEAM_GHOST_1");
    Team ghost2 = teamRepo.findByName("TEAM_GHOST_2");
    Team ghost3 = teamRepo.findByName("TEAM_GHOST_3");
    Team ghost4 = teamRepo.findByName("TEAM_GHOST_4");
    // 1. Create the FINAL (nextMatch is null)
    Match finalMatch = InitializerUtils.createOneMatch(
        springBattle, null, null, 3, null,
        LocalDateTime.of(2026, 5, 10, 20, 0),
        MatchStatus.PLANNED, matchRepo, matchLineupRepo
    );

    Match deltaVSiota = InitializerUtils.createOneMatch(
        springBattle, delta, iota, 2, finalMatch,
        LocalDateTime.of(2026, 5, 7, 6, 30),
        MatchStatus.PLANNED, matchRepo, matchLineupRepo
    );

    Match omegaVSalpha = InitializerUtils.createOneMatch(
        springBattle, omega, alpha, 2, finalMatch,
        LocalDateTime.of(2026, 5, 7, 23, 30),
        MatchStatus.PLANNED, matchRepo, matchLineupRepo
    );

    Match g1vsiota = InitializerUtils.createOneMatch(
        springBattle, ghost1, iota, 1, deltaVSiota,
        LocalDateTime.of(2026, 5, 5, 16, 45),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    matchLineupRepo.findByMatchAndTeam(g1vsiota, iota).ifPresent(lineup -> {
      lineup.replaceLineup(Set.of(
          memberRepo.findByEmail("lisa@mail.com"),
          memberRepo.findByEmail("noa@mail.com"),
          memberRepo.findByEmail("tim@mail.com"),
          memberRepo.findByEmail("zoe@mail.com")
      ));
      lineup.setScore(4);
      matchLineupRepo.save(lineup);
    });
    matchLineupRepo.findByMatchAndTeam(g1vsiota, ghost1).ifPresent(lineup -> {
      lineup.setScore(0);
      matchLineupRepo.save(lineup);
    });

    Match g2vsdelta = InitializerUtils.createOneMatch(
        springBattle, ghost2, delta, 1, deltaVSiota,
        LocalDateTime.of(2026, 5, 5, 19, 0),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    matchLineupRepo.findByMatchAndTeam(g2vsdelta, delta).ifPresent(lineup -> {
      lineup.replaceLineup(Set.of(
          memberRepo.findByEmail("zed@mail.com"),
          memberRepo.findByEmail("ali@mail.com"),
          memberRepo.findByEmail("fin@mail.com"),
          memberRepo.findByEmail("max@mail.com")
      ));
      lineup.setScore(5);
      matchLineupRepo.save(lineup);
    });

    matchLineupRepo.findByMatchAndTeam(g2vsdelta, ghost2).ifPresent(lineup -> {
      lineup.setScore(2);
      matchLineupRepo.save(lineup);
    });

    Match g3vsalpha = InitializerUtils.createOneMatch(
        springBattle, ghost3, alpha, 1, omegaVSalpha,
        LocalDateTime.of(2026, 5, 5, 20, 30),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    // saving the lineup composition and score
    matchLineupRepo.findByMatchAndTeam(g3vsalpha, alpha).ifPresent(lineup -> {
      lineup.replaceLineup(Set.of(
          memberRepo.findByEmail("lea@mail.com"),
          memberRepo.findByEmail("tom@mail.com"),
          memberRepo.findByEmail("ines@mail.com"),
          memberRepo.findByEmail("pol@mail.com")
      ));
      lineup.setScore(5);
      matchLineupRepo.save(lineup);
    });
    matchLineupRepo.findByMatchAndTeam(g3vsalpha, ghost3).ifPresent(lineup -> {
      lineup.setScore(3);
      matchLineupRepo.save(lineup);
    });

    Match g4vsomega = InitializerUtils.createOneMatch(
        springBattle, ghost4, omega, 1, omegaVSalpha,
        LocalDateTime.of(2026, 5, 5, 20, 15),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    // saving the lineup composition and score
    matchLineupRepo.findByMatchAndTeam(g4vsomega, omega).ifPresent(lineup -> {
      lineup.replaceLineup(
          Set.of(memberRepo.findByEmail("tibo@mail.com"), memberRepo.findByEmail("neo@mail.com")
          ));
      lineup.setScore(5);
      matchLineupRepo.save(lineup);
    });
    matchLineupRepo.findByMatchAndTeam(g4vsomega, ghost4).ifPresent(lineup -> {
      lineup.setScore(0);
      matchLineupRepo.save(lineup);
    });

    // set up match history for tibo@mail.com
    Tournament eliteChamp25 = StreamSupport.stream(tournamentRepo.findAll().spliterator(), false)
        .filter(t -> "Elite Championship 2025".equals(t.getName())).findFirst().orElse(null);

    Match tiboMatch2 = InitializerUtils.createOneMatch(
        eliteChamp25, omega, ghost1, 2, null,
        LocalDateTime.of(2025, 5, 15, 20, 4),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    matchLineupRepo.findByMatchAndTeam(tiboMatch2, omega).ifPresent(lineup -> {
      lineup.replaceLineup(
          Set.of(memberRepo.findByEmail("tibo@mail.com")
          ));
      lineup.setScore(3);
      matchLineupRepo.save(lineup);
    });
    matchLineupRepo.findByMatchAndTeam(tiboMatch2, ghost1).ifPresent(lineup -> {
      lineup.setScore(5);
      matchLineupRepo.save(lineup);
    });

    Tournament winterClash26 = StreamSupport.stream(tournamentRepo.findAll().spliterator(), false)
        .filter(t -> "Vinci Winter Clash 2026".equals(t.getName())).findFirst().orElse(null);

    Match tiboMatch3 = InitializerUtils.createOneMatch(
        winterClash26, omega, ghost1, 2, null,
        LocalDateTime.of(2026, 1, 12, 16, 50),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    matchLineupRepo.findByMatchAndTeam(tiboMatch3, omega).ifPresent(lineup -> {
      lineup.replaceLineup(
          Set.of(memberRepo.findByEmail("tibo@mail.com")
          ));
      lineup.setScore(4);
      matchLineupRepo.save(lineup);
    });
    matchLineupRepo.findByMatchAndTeam(tiboMatch3, ghost1).ifPresent(lineup -> {
      lineup.setScore(1);
      lineup.replaceLineup(Set.of(
          memberRepo.findByEmail("lea@mail.com"),
          memberRepo.findByEmail("tom@mail.com")));
      matchLineupRepo.save(lineup);
    });

    Match tiboMatch4 = InitializerUtils.createOneMatch(
        winterClash26, omega, alpha, 1, tiboMatch3,
        LocalDateTime.of(2026, 1, 11, 19, 0),
        MatchStatus.PLAYED, matchRepo, matchLineupRepo
    );
    matchLineupRepo.findByMatchAndTeam(tiboMatch4, omega).ifPresent(lineup -> {
      lineup.replaceLineup(
          Set.of(memberRepo.findByEmail("tibo@mail.com")
          ));
      lineup.setScore(5);
      lineup.setWinner(true);
      matchLineupRepo.save(lineup);
    });
    matchLineupRepo.findByMatchAndTeam(tiboMatch4, alpha).ifPresent(lineup -> {
      lineup.setHasForfeited(true);
      matchLineupRepo.save(lineup);
    });
    System.out.println("--- DEMO DATA INITIALIZATION COMPLETE ---");
  }

}
