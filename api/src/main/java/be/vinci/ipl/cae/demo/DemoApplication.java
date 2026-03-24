package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


/**
 * Main class of the application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
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
      NotificationRepository notifsRepo,
      TeamRepository teamRepo,
      SpecialtyRepository specRepo, ProfileImageRepository imageRepo) {
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
      member4 = memberRepo.save(member4);

      // Create Team "TEAM_ALPHA"
      Team team1 =
          new Team();
      team1.setName("TEAM_ALPHA");
      team1.setIsActive(true);
      team1.setManager1(member1);
      team1 = teamRepo.save(team1);

      // Create Team "TEAM_ALPHA"
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



      // insert profile image paths into database
      for (int i = 1; i <= 20; i++) {
        ProfileImage image = new ProfileImage();
        image.setPath("profile-" + i + ".png");
        imageRepo.save(image);
      }

      // Add profile image to members
      member1.setProfileImage(imageRepo.getProfileImageByIdImage(1L));
      member2.setProfileImage(imageRepo.getProfileImageByIdImage(2L));
      member3.setProfileImage(imageRepo.getProfileImageByIdImage(3L));
      member4.setProfileImage(imageRepo.getProfileImageByIdImage(4L));
      memberRepo.save(member1);
      memberRepo.save(member2);
      memberRepo.save(member3);
      memberRepo.save(member4);
    };
  }

}
