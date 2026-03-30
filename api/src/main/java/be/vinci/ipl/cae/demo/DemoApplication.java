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
import java.util.HashMap;
import java.util.Map;
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
  CommandLineRunner seed(
      MemberRepository memberRepo,
      TeamRepository teamRepo,
      SpecialtyRepository specRepo,
      ProfileImageRepository imageRepo,
      TournamentRepository tournamentRepo
  ) {
    return args -> {
      // Create Specialities
      String[] specialities = {
          "architecte",
          "exécuteur",
          "tacticien",
          "gardien",
          "catalyseur",
          "perturbateur",
          "guérisseur"
      };
      Map<String, Specialty> specMap =
          new HashMap<>();
      for (String specialty : specialities) {
        Specialty spec =
            new Specialty();
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
      record MemberMockData(
          String email,
          String tag,
          String specialty,
          String creationDate,
          boolean isAdmin,
          boolean isManager,
          String teamName
      ) {}

      MemberMockData[] memberDataList = {
          new MemberMockData("lea@mail.com", "Lynx", "tacticien", "2025-11-12", true, true, "TEAM_ALPHA"),
          new MemberMockData("tom@mail.com", "Rogue", "exécuteur", "2025-12-03", false, false, "TEAM_ALPHA"),
          new MemberMockData("ines@mail.com", "Pulse", "guérisseur", "2026-01-18", false, false, "TEAM_ALPHA"),
          new MemberMockData("tibo@mail.com", "Iron", "gardien", "2025-10-27", true, true, "TEAM_OMEGA"),
          new MemberMockData("lisa@mail.com", "Storm", "exécuteur", "2026-01-10", false, true, "TEAM_IOTA"),
          new MemberMockData("noa@mail.com", "Flash", "architecte", "2026-02-02", false, true, "TEAM_IOTA"),
          new MemberMockData("tim@mail.com", "Titi", "gardien", "2026-02-03", false, false, "TEAM_IOTA"),
          new MemberMockData("zoe@mail.com", "Vector", "catalyseur", "2026-02-04", false, false, "TEAM_IOTA")
      };

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

      // Create Tournaments
      // 1. IN_PREPARATION
      Tournament t1 = new Tournament();
      t1.setName("Tournament Alpha");
      t1.setDescription("A tournament in preparation.");
      t1.setRegistrationDeadline(LocalDate.of(2026, 10, 1).atStartOfDay());
      t1.setStartDate(LocalDate.of(2026, 10, 15));
      t1.setEndDate(LocalDate.of(2026, 10, 20));
      t1.setTournamentStatus(TournamentStatus.IN_PREPARATION);
      t1.setMaxNbOfTeams(8);
      tournamentRepo.save(t1);

      // 2. REGISTRATION_OPEN
      Tournament t2 = new Tournament();
      t2.setName("Tournament Beta");
      t2.setDescription("Registration is open for this tournament.");
      t2.setRegistrationDeadline(LocalDate.of(2026, 11, 1).atStartOfDay());
      t2.setStartDate(LocalDate.of(2026, 11, 15));
      t2.setEndDate(LocalDate.of(2026, 11, 20));
      t2.setTournamentStatus(TournamentStatus.REGISTRATION_OPEN);
      t2.setMaxNbOfTeams(16);
      tournamentRepo.save(t2);

      // 3. REGISTRATION_CLOSED
      Tournament t3 = new Tournament();
      t3.setName("Tournament Gamma");
      t3.setDescription("Registration is closed but not planned yet.");
      t3.setRegistrationDeadline(LocalDate.of(2026, 3, 1).atStartOfDay());
      t3.setStartDate(LocalDate.of(2026, 4, 15));
      t3.setEndDate(LocalDate.of(2026, 4, 20));
      t3.setTournamentStatus(TournamentStatus.REGISTRATION_CLOSED);
      t3.setMaxNbOfTeams(8);
      tournamentRepo.save(t3);

      // 4. PLANNED
      Tournament t4 = new Tournament();
      t4.setName("Tournament Delta");
      t4.setDescription("This tournament is fully planned.");
      t4.setRegistrationDeadline(LocalDate.of(2026, 3, 1).atStartOfDay());
      t4.setStartDate(LocalDate.of(2026, 5, 15));
      t4.setEndDate(LocalDate.of(2026, 5, 20));
      t4.setTournamentStatus(TournamentStatus.PLANNED);
      t4.setMaxNbOfTeams(12);
      tournamentRepo.save(t4);

      // 5. IN_PROGRESS
      Tournament t5 = new Tournament();
      t5.setName("Tournament Epsilon");
      t5.setDescription("Tournament currently in progress.");
      t5.setRegistrationDeadline(LocalDate.of(2026, 2, 1).atStartOfDay());
      t5.setStartDate(LocalDate.of(2026, 3, 20));
      t5.setEndDate(LocalDate.of(2026, 5, 30));
      t5.setTournamentStatus(TournamentStatus.IN_PROGRESS);
      t5.setMaxNbOfTeams(4);
      tournamentRepo.save(t5);

      // 6. DONE
      Tournament t6 = new Tournament();
      t6.setName("Tournament Zeta");
      t6.setDescription("A completed tournament.");
      t6.setRegistrationDeadline(LocalDate.of(2026, 1, 1).atStartOfDay());
      t6.setStartDate(LocalDate.of(2026, 2, 15));
      t6.setEndDate(LocalDate.of(2026, 2, 20));
      t6.setTournamentStatus(TournamentStatus.DONE);
      t6.setMaxNbOfTeams(8);
      tournamentRepo.save(t6);
    };
  }

}
