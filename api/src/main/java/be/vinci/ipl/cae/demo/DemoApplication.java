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

      // Create Member 1: Manager
      String pw = "Password1!";
      String encodedPw = new BCryptPasswordEncoder().encode(pw);
      Member member1 = new Member();
      member1.setEmail("lea@mail.com");
      member1.setPassword(encodedPw);
      member1.setTag("Lynx");
      member1.setCreationDate(LocalDateTime.of(2025, 11, 12, 0, 0));
      member1.setAdmin(false);
      member1.setDeleted(false);
      member1.setSpecialty(specMap.get("tacticien"));
      member1.setProfileImage(imageRepo.getProfileImageByIdImage(1L));
      member1 = memberRepo.save(member1);

      // Create Member 2: Player
      Member member2 = new Member();
      member2.setEmail("tom@mail.com");
      member2.setPassword(encodedPw);
      member2.setTag("Rogue");
      member2.setCreationDate(LocalDateTime.of(2025, 12, 3, 0, 0));
      member2.setAdmin(false);
      member2.setDeleted(false);
      member2.setSpecialty(specMap.get("exécuteur"));
      member2.setProfileImage(imageRepo.getProfileImageByIdImage(2L));
      member2 = memberRepo.save(member2);

      // Create Member 3: Admin
      Member member3 = new Member();
      member3.setEmail("ines@mail.com");
      member3.setPassword(encodedPw);
      member3.setTag("Pulse");
      member3.setCreationDate(LocalDateTime.of(2026, 1, 18, 0, 0));
      member3.setAdmin(true);
      member3.setDeleted(false);
      member3.setSpecialty(specMap.get("guérisseur"));
      member3.setProfileImage(imageRepo.getProfileImageByIdImage(3L));
      member3 = memberRepo.save(member3);

      // Create Member 4: Admin and Manager
      Member member4 = new Member();
      member4.setEmail("tibo@mail.com");
      member4.setPassword(encodedPw);
      member4.setTag("Iron");
      member4.setCreationDate(LocalDateTime.of(2025, 10, 27, 0, 0));
      member4.setAdmin(true);
      member4.setDeleted(false);
      member4.setSpecialty(specMap.get("gardien"));
      member4.setProfileImage(imageRepo.getProfileImageByIdImage(4L));
      member4 = memberRepo.save(member4);

      // Create Team "TEAM_ALPHA"
      Team team1 =
          new Team();
      team1.setName("TEAM_ALPHA");
      team1.setIsActive(true);
      team1.setManager1(member1);
      team1 = teamRepo.save(team1);

      // Create Team "TEAM_OMEGA"
      Team team2 =
          new Team();
      team2.setName("TEAM_OMEGA");
      team2.setIsActive(true);
      team2.setManager1(member4);
      team2 = teamRepo.save(team2);

      // Link members to team
      member1.setTeam(team1);
      member2.setTeam(team1);
      member3.setTeam(team1);
      member4.setTeam(team2);
      memberRepo.save(member1);
      memberRepo.save(member2);
      memberRepo.save(member3);
      memberRepo.save(member4);

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
