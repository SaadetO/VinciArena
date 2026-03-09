package be.vinci.ipl.cae.demo;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Speciality;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialityRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;


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
      SpecialityRepository specRepo) {
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
      Map<String, Speciality> specMap =
          new HashMap<>();
      for (String specialty : specialities) {
        Speciality spec =
            new Speciality();
        spec.setName(specialty);
        specMap.put(specialty, specRepo.save(spec));
      }

      // Create Member 1: Manager
      Member member1 = new Member();
      member1.setEmail("larry@cae.com");
      member1.setPassword("$2y$10$EW75BdcbCfKEA3NbE7in4OiYYacfP3OY4Q2JsVzjxd3jNxxgAEZNu");
      member1.setTag("Larry");
      member1.setAdmin(true);
      member1.setDeleted(false);
      member1.setSpeciality(specMap.get("architecte"));
      member1 = memberRepo.save(member1);

      // Create Member 2: Player
      Member member2 = new Member();
      member2.setEmail("barry@cae.com");
      member2.setPassword("$2y$10$EW75BdcbCfKEA3NbE7in4OiYYacfP3OY4Q2JsVzjxd3jNxxgAEZNu");
      member2.setTag("Barry");
      member2.setAdmin(false);
      member2.setDeleted(false);
      member2.setSpeciality(specMap.get("exécuteur"));
      member2 = memberRepo.save(member2);

      // Create Team
      Team team1 =
          new Team();
      team1.setName("M8");
      team1.setIsActive(true);
      team1.setManager1(member1);
      team1 = teamRepo.save(team1);

      // Link members to team
      member1.setTeam(team1);
      member2.setTeam(team1);
      memberRepo.save(member1);
      memberRepo.save(member2);

      // Create Notifications for Member 1
      Notification notif1 = new Notification();
      notif1.setMember(member1);
      notif1.setContent("Welcome to the team, Larry!");
      notif1.setRead(false);
      notifsRepo.save(notif1);

      // Create Notification for Member 2
      Notification notif2 = new Notification();
      notif2.setMember(member2);
      notif2.setContent("Your match result has been confirmed, Barry.");
      notif2.setRead(false);
      notifsRepo.save(notif2);
    };
  }

}
