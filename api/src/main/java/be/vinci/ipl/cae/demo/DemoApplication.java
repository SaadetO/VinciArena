package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
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
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
@EnableScheduling
public class DemoApplication {

  /**
   * Main method of the application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {

    SpringApplication.run(DemoApplication.class, args);
  }

  // default values for test
  @Bean
  CommandLineRunner seed(MemberRepository memberRepo, TeamRepository teamRepo,
      SpecialtyRepository specRepo, ProfileImageRepository imageRepo,
      TournamentRepository tournamentRepo) {
    return args -> {
      // Create Specialities
      String[] specialities = {"architecte", "exécuteur", "tacticien", "gardien", "catalyseur",
          "perturbateur", "guérisseur"};
      Map<String, Specialty> specMap = new HashMap<>();
      for (String specialty : specialities) {
        Specialty spec = new Specialty();
        spec.setName(specialty);
        specMap.put(specialty, specRepo.save(spec));
      }

      // insert profile image paths into database
      for (int i = 1; i <= 20; i++) {
        ProfileImage image = new ProfileImage();
        image.setPath("profile-" + i + ".png");
        imageRepo.save(image);
      }

      // Create Members and Teams for demo
      record MemberMockData(String email, String tag, String specialty, String creationDate,
                            boolean isAdmin, boolean isManager, String teamName) {

      }

      record TournamentMockData(String name, String description, String start, String end,
                                String deadline, int capacity, int teamCount, String winnerTeamName,
                                TournamentStatus status) {

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
              "TEAM_IOTA")};

      Map<String, Team> teamMap = new HashMap<>();
      String pw = "Password1!";
      String encodedPw = new BCryptPasswordEncoder().encode(pw);

      for (int i = 0; i < memberDataList.length; i++) {
        MemberMockData data = memberDataList[i];

        Member member = new Member();
        member.setEmail(data.email());
        member.setPassword(encodedPw);
        member.setTag(data.tag());
        member.setCreationDate(LocalDate.parse(data.creationDate()).atStartOfDay());
        member.setAdmin(data.isAdmin());
        member.setDeleted(false);
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
      // generer une liste d'équipes supplémentaires pour atteindre le compte (ex: 15 teams)
      Map<String, Team> allTeamsMap = new HashMap<>(teamMap); // On garde Alpha, Omega, Iota
      for (int i = 1; i <= 15; i++) {
        String name = "TEAM_GHOST_" + i;
        if (!allTeamsMap.containsKey(name)) {
          Team t = new Team();
          t.setName(name);
          t.setIsActive(true);
          allTeamsMap.put(name, teamRepo.save(t));
        }
      }
      List<Team> poolOfTeams = new ArrayList<>(allTeamsMap.values());

      TournamentMockData[] tournamentDataList = {
          // PASSÉS (DONE)
          new TournamentMockData("Spring Arena Cup 2025",
              "Compétition printanière ouverte aux nouvelles teams émergentes", "2025-04-15",
              "2025-04-25", "2025-04-10T20:00:00", 8, 7, "TEAM_OMEGA", TournamentStatus.DONE),
          new TournamentMockData("Elite Championship 2025",
              "Compétition élite réservée aux meilleures teams", "2025-05-15", "2025-05-30",
              "2025-05-11T20:00:00", 8, 6, "TEAM_IOTA", TournamentStatus.DONE),
          new TournamentMockData("Summer Pro League 2025",
              "Tournoi estival de haut niveau avec les meilleures teams", "2025-07-01",
              "2025-07-15", "2025-06-25T20:00:00", 16, 14, "TEAM_IOTA", TournamentStatus.DONE),
          new TournamentMockData("Vinci Winter Clash 2026",
              "Tournoi hivernal réunissant des équipes semi-professionnelles", "2026-01-10",
              "2026-01-20", "2026-01-05T20:00:00", 12, 12, "TEAM_ALPHA", TournamentStatus.DONE),


          new TournamentMockData("Spring Battle Series 2026",
              "Série printanière avec élimination directe", "2026-04-04", "2026-04-11",
              "2026-04-01T20:00:00", 8, 8, null, TournamentStatus.IN_PROGRESS),


          new TournamentMockData("Vinci Easter Cup 2026",
              "Tournoi de Pâques ouvert à toutes les teams actives", "2026-04-15", "2026-04-25",
              "2026-04-08T20:00:00", 8, 7, null, TournamentStatus.REGISTRATION_OPEN),
          new TournamentMockData("Elite Championship 2026",
              "Compétition élite réservée aux meilleures teams", "2026-05-15", "2026-05-30",
              "2026-05-11T20:00:00", 16, 14, null, TournamentStatus.REGISTRATION_OPEN)};

      for (TournamentMockData data : tournamentDataList) {
        Tournament t = new Tournament();
        t.setName(data.name());
        t.setDescription(data.description());
        t.setStartDate(LocalDate.parse(data.start()));
        t.setEndDate(LocalDate.parse(data.end()));
        t.setRegistrationDeadline(LocalDateTime.parse(data.deadline()));
        t.setCapacity(data.capacity());
        t.setStatus(data.status());
        t.setWinner(teamMap.get(data.winnerTeamName));

        // Remplissage des teams inscrites (Set<Team>)
        Set<Team> registered = new HashSet<>();
        for (int i = 0; i < data.teamCount() && i < poolOfTeams.size(); i++) {
          registered.add(poolOfTeams.get(i));
        }

        // On force la présence du gagnant dans les inscrits
        if (data.winnerTeamName() != null) {
          Team winner = teamMap.get(data.winnerTeamName());
          if (winner != null) {
            registered.add(winner);
          }
        }

        t.setTeams(registered);
        tournamentRepo.save(t);
      }

    };
  }

}
