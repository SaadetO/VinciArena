package be.vinci.ipl.cae.demo.initializers;

import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.MatchStatus;
import be.vinci.ipl.cae.demo.models.entities.Member;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Component responsible for seeding the database with initial demo data.
 */
@Component
public class DataSeeder implements CommandLineRunner {

  private final MemberRepository memberRepo;
  private final TeamRepository teamRepo;
  private final SpecialtyRepository specRepo;
  private final ProfileImageRepository imageRepo;
  private final TournamentRepository tournamentRepo;
  private final MatchRepository matchRepo;
  private final MatchLineupRepository matchLineupRepo;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  /**
   * Inserts default information.
   *
   * @param memberRepo      member repository
   * @param teamRepo        team repository
   * @param specRepo        specializations repository
   * @param imageRepo       image repository
   * @param tournamentRepo  tournament repository
   * @param matchRepo       match repository
   * @param matchLineupRepo match lineup repository
   */
  public DataSeeder(MemberRepository memberRepo, TeamRepository teamRepo,
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
    Map<String, Specialty> specMap = seedSpecialties();
    seedProfileImages();
    Map<String, Team> teamMap = seedMembersAndTeams(specMap);
    List<Team> poolOfTeams = seedAdditionalTeams(teamMap);
    seedTournaments(teamMap, poolOfTeams);
    seedMatches(teamMap);
  }

  private Map<String, Specialty> seedSpecialties() {
    String[] specialties = {"architecte", "exécuteur", "tacticien", "gardien", "catalyseur",
        "perturbateur", "guérisseur"};
    Map<String, Specialty> specMap = new HashMap<>();
    for (String name : specialties) {
      Specialty spec = new Specialty();
      spec.setName(name);
      specMap.put(name, specRepo.save(spec));
    }
    return specMap;
  }

  private void seedProfileImages() {
    for (int i = 1; i <= 20; i++) {
      ProfileImage image = new ProfileImage();
      image.setPath("profile-" + i + ".png");
      imageRepo.save(image);
    }
  }

  private Map<String, Team> seedMembersAndTeams(Map<String, Specialty> specMap) {
    record MemberMockData(String email, String tag, String specialty, String creationDate,
                          boolean isAdmin, boolean isManager, String teamName) {

    }

    MemberMockData[] memberDataList = {
        new MemberMockData("lea@mail.com", "Lynx", "tacticien", "2025-11-12", true, true,
            "TEAM_ALPHA"),
        new MemberMockData("tom@mail.com", "Rogue", "exécuteur", "2025-12-03", false, false,
            "TEAM_ALPHA"),
        new MemberMockData("ines@mail.com", "Pulse", "guérisseur", "2026-01-18", false, false,
            "TEAM_ALPHA"),
        new MemberMockData("tibo@mail.com", "Iron", "gardien", "2025-10-27", true, true,
            "TEAM_OMEGA"),
        new MemberMockData("lisa@mail.com", "Storm", "exécuteur", "2026-01-10", false, true,
            "TEAM_IOTA"),
        new MemberMockData("noa@mail.com", "Flash", "architecte", "2026-02-02", false, true,
            "TEAM_IOTA"),
        new MemberMockData("tim@mail.com", "Titi", "gardien", "2026-02-03", false, false,
            "TEAM_IOTA"),
        new MemberMockData("zoe@mail.com", "Vector", "catalyseur", "2026-02-04", false, false,
            "TEAM_IOTA"),
        //-----
        new MemberMockData("marc@mail.com", "Atlas", "gardien", "2026-03-01", false, true,
            "TEAM_BETA"),
        new MemberMockData("sara@mail.com", "Nova", "perturbateur", "2026-03-02", false, true,
            "TEAM_BETA"),
        new MemberMockData("luc@mail.com", "Shadow", "exécuteur", "2026-03-03", false, false,
            "TEAM_BETA"),
        new MemberMockData("emma@mail.com", "Luna", "guérisseur", "2026-03-04", false, false,
            "TEAM_BETA"),
        new MemberMockData("hugo@mail.com", "Apex", "tacticien", "2026-03-10", false, true,
            "TEAM_SIGMA"),
        new MemberMockData("jade@mail.com", "Viper", "catalyseur", "2026-03-11", false, true,
            "TEAM_SIGMA"),
        new MemberMockData("axel@mail.com", "Ghost", "architecte", "2026-03-12", false, false,
            "TEAM_SIGMA"),
        new MemberMockData("nina@mail.com", "Zenith", "exécuteur", "2026-03-13", false, false,
            "TEAM_SIGMA"),
        new MemberMockData("leo@mail.com", "Venti", "catalyseur", "2026-06-04", false, false,
            "TEAM_ALPHA")
    };

    String encodedPw = passwordEncoder.encode("Password1!");
    Map<String, Team> teamMap = new HashMap<>();

    for (int i = 0; i < memberDataList.length; i++) {
      MemberMockData data = memberDataList[i];
      Member member = new Member();
      member.setEmail(data.email());
      member.setPassword(encodedPw);
      member.setTag(data.tag());
      member.setCreationDate(LocalDate.parse(data.creationDate()).atStartOfDay());
      member.setAdmin(data.isAdmin());
      member.setSpecialty(specMap.get(data.specialty()));
      member.setProfileImage(imageRepo.getProfileImageByIdImage((long) ((i % 20) + 1)));

      Team team = teamMap.computeIfAbsent(data.teamName(), name -> {
        Team t = new Team();
        t.setName(name);
        t.setIsActive(true);
        return teamRepo.save(t);
      });

      member.setTeam(team);
      member = memberRepo.save(member);

      if (data.isManager()) {
        if (team.getManager1() == null) {
          team.setManager1(member);
        } else if (team.getManager2() == null) {
          team.setManager2(member);
        }
        teamRepo.save(team);
      }
    }
    return teamMap;
  }

  private List<Team> seedAdditionalTeams(Map<String, Team> teamMap) {
    Map<String, Team> allTeamsMap = new HashMap<>(teamMap);
    for (int i = 1; i <= 15; i++) {
      String name = "TEAM_GHOST_" + i;
      allTeamsMap.computeIfAbsent(name, n -> {
        Team t = new Team();
        t.setName(n);
        t.setIsActive(true);
        return teamRepo.save(t);
      });
    }
    return new ArrayList<>(allTeamsMap.values());
  }

  private void seedTournaments(Map<String, Team> teamMap, List<Team> poolOfTeams) {
    record TournamentMockData(String name, String description, String start, String end,
                              String deadline, int capacity, int teamCount, String winnerTeamName,
                              TournamentStatus status) {

    }

    TournamentMockData[] tournamentDataList = {
        new TournamentMockData("Spring Arena Cup 2025", "Compétition printanière", "2025-04-15",
            "2025-04-25", "2025-04-10T20:00:00", 8, 7, "TEAM_OMEGA", TournamentStatus.DONE),
        new TournamentMockData("Elite Championship 2025", "Compétition élite", "2025-05-15",
            "2025-05-30", "2025-05-11T20:00:00", 8, 6, "TEAM_IOTA", TournamentStatus.DONE),
        new TournamentMockData("Summer Pro League 2025", "Tournoi estival", "2025-07-01",
            "2025-07-15", "2025-06-25T20:00:00", 16, 14, "TEAM_IOTA", TournamentStatus.DONE),
        new TournamentMockData("Vinci Winter Clash 2026", "Tournoi semi-pro", "2026-01-10",
            "2026-01-20", "2026-01-05T20:00:00", 12, 12, "TEAM_ALPHA", TournamentStatus.DONE),
        new TournamentMockData("Spring Battle Series 2026", "Élimination directe", "2026-04-04",
            "2026-04-11", "2026-04-01T20:00:00", 8, 8, null, TournamentStatus.IN_PROGRESS),
        new TournamentMockData("Vinci Easter Cup 2026", "Tournoi de Pâques", "2027-04-15",
            "2027-04-25", "2027-04-08T20:00:00", 8, 7, null, TournamentStatus.REGISTRATION_OPEN),
        new TournamentMockData("Elite Championship 2026", "Compétition élite 2026", "2026-05-15",
            "2026-05-30", "2026-05-11T20:00:00", 16, 14, null, TournamentStatus.REGISTRATION_OPEN)
    };

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

      List<Team> registered = new ArrayList<>();
      for (int i = 0; i < data.teamCount() && i < poolOfTeams.size()-1; i++) {
        registered.add(poolOfTeams.get(i));
      }
      if (data.winnerTeamName() != null && teamMap.containsKey(data.winnerTeamName())) {
        Team winner = teamMap.get(data.winnerTeamName());
        if (!registered.contains(winner)) {
          registered.add(winner);
        }
      }
      t.setTeams(registered);
      tournamentRepo.save(t);
    }
  }

  private void seedMatches(Map<String, Team> teamMap) {
    Tournament springBattle = StreamSupport.stream(tournamentRepo.findAll().spliterator(), false)
        .filter(t -> "Spring Battle Series 2026".equals(t.getName()))
        .findFirst().orElse(null);

    Team alpha = teamMap.get("TEAM_ALPHA");
    Team omega = teamMap.get("TEAM_OMEGA");
    Team iota = teamMap.get("TEAM_IOTA");
    Team ghost1 = teamRepo.findByName("TEAM_GHOST_1");

    if (springBattle != null) {
      Match m1 = createMatch(springBattle, alpha, omega, 14);
      Match m2 = createMatch(springBattle, iota, ghost1, 16);

      createEmptyLineup(m1, alpha);
      createEmptyLineup(m1, omega);
      createEmptyLineup(m2, iota);
      createEmptyLineup(m2, ghost1);
    }
  }

  private Match createMatch(Tournament t, Team t1, Team t2, int hour) {
    Match m = new Match();
    m.setTournament(t);
    m.setTeam1(t1);
    m.setTeam2(t2);
    m.setTurn(1);
    m.setDateHour(LocalDateTime.now().plusDays(2).withHour(hour).withMinute(0));
    m.setStatus(MatchStatus.PLANNED);
    return matchRepo.save(m);
  }

  private void createEmptyLineup(Match m, Team t) {
    MatchLineup lineup = new MatchLineup();
    lineup.setMatch(m);
    lineup.setTeam(t);
    lineup.setMembers(new HashSet<>());
    matchLineupRepo.save(lineup);
  }
}