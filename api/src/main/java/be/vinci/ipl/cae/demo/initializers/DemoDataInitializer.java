package be.vinci.ipl.cae.demo.initializers;

import be.vinci.ipl.cae.demo.initializers.InitializerUtils.MemberMockData;
import be.vinci.ipl.cae.demo.initializers.InitializerUtils.TournamentMockData;
import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
    String[] specialities = {"architecte", "exécuteur", "tacticien", "gardien", "catalyseur",
        "perturbateur", "guérisseur"};

    Map<String, Specialty> specMap = new HashMap<>();
    for (String specialty : specialities) {
      Specialty spec = new Specialty();
      spec.setName(specialty);
      specMap.put(specialty, specRepo.save(spec));
    }

    // Insert profile image paths
    for (int i = 1; i <= 20; i++) {
      ProfileImage image = new ProfileImage();
      image.setPath("profile-" + i + ".png");
      imageRepo.save(image);
    }

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

        new TournamentMockData("Elite Championship 2026",
            "Compétition élite réservée aux meilleures teams", "2026-05-15", "2026-05-30",
            "2026-05-11T20:00:00", 16, 14, null, TournamentStatus.REGISTRATION_OPEN),};

    TournamentMockData currentTournament = new TournamentMockData("Spring Battle Series 2026",
        "Série printanière avec élimination directe et forte participation", "2026-05-04",
        "2026-05-12", "2026-05-01T23:59:59", 8, 8, null, TournamentStatus.IN_PROGRESS);

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
      t.registerTeam(teamMap.get("TEAM_ALPHA"));
      t.registerTeam(teamMap.get("TEAM_DELTA"));
      t.registerTeam(teamMap.get("TEAM_IOTA"));
      t.registerTeam(teamMap.get("TEAM_OMEGA"));
      InitializerUtils.completeTournamentRegistration(t, ghostTeams, data.teamCount(),
          tournamentRepo);

    }

    Tournament currentT = new Tournament();
    currentT.setName(currentTournament.name());
    currentT.setDescription(currentTournament.description());
    currentT.setStartDate(LocalDate.parse(currentTournament.start()));
    currentT.setEndDate(LocalDate.parse(currentTournament.end()));
    currentT.setRegistrationDeadline(LocalDateTime.parse(currentTournament.deadline()));
    currentT.setCapacity(currentTournament.capacity());
    currentT.setStatus(currentTournament.status());
    currentT.setWinner(teamMap.get(currentTournament.winnerTeamName()));
    currentT.registerTeam(teamMap.get("TEAM_ALPHA"));
    currentT.registerTeam(teamMap.get("TEAM_IOTA"));
    InitializerUtils.completeTournamentRegistration(currentT, ghostTeams,
        currentTournament.teamCount(), tournamentRepo);

    // create mock matches
    Tournament springBattle = StreamSupport.stream(tournamentRepo.findAll().spliterator(), false)
        .filter(t -> "Spring Battle Series 2026".equals(t.getName())).findFirst().orElse(null);
    Team alpha = teamRepo.findByName("TEAM_ALPHA");
    Team delta = teamRepo.findByName("TEAM_DELTA");
    Team iota = teamRepo.findByName("TEAM_IOTA");
    Team omega = teamRepo.findByName("TEAM_OMEGA");

    // MATCH 1: delta vs iota
    Match match1 = new Match();
    match1.setTournament(springBattle);
    match1.setTeam1(delta);
    match1.setTeam2(iota);
    match1.setTurn(1);
    match1.setDateHour(LocalDateTime.of(2026, 05, 07, 6, 15));
    match1.setStatus(MatchStatus.PLANNED);
    match1 = matchRepo.save(match1);

    // MATCH 2: omega vs alpha
    Match match2 = new Match();
    match2.setTournament(springBattle);
    match2.setTeam1(omega);
    match2.setTeam2(alpha);
    match2.setTurn(1);
    match2.setDateHour(LocalDateTime.of(2026, 05, 07, 22, 30));
    match2.setStatus(MatchStatus.PLANNED);
    match2 = matchRepo.save(match2);
    // After match1 = matchRepo.save(match1);
    createEmptyMatchLineup(match1, delta, matchLineupRepo);
    createEmptyMatchLineup(match1, iota, matchLineupRepo);

// After match2 = matchRepo.save(match2);
    createEmptyMatchLineup(match2, omega, matchLineupRepo);
    createEmptyMatchLineup(match2, alpha, matchLineupRepo);

    System.out.println("--- DEMO DATA INITIALIZATION COMPLETE ---");
  }

  private void createEmptyMatchLineup(Match match, Team team,
      MatchLineupRepository matchLineupRepo) {
    MatchLineup lineup = new MatchLineup();
    lineup.setMatch(match);
    lineup.setTeam(team);
    lineup.setMembers(new HashSet<>());
    matchLineupRepo.save(lineup);
  }
}
