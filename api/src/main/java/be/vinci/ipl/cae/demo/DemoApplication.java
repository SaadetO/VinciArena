package be.vinci.ipl.cae.demo;


import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
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
  CommandLineRunner seed(MemberRepository memberRepo, NotificationRepository notifsRepo) {
    return args -> {
      Member member1 = new Member();
      member1.setEmail("alice@vinci.be");
      member1.setPassword("hashed_password_123");
      member1.setTag("AliceV");
      member1.setAdmin(true);
      member1.setDeleted(false);
      memberRepo.save(member1);
      // (Assumes you have saved team/speciality/profileImage or they are null)

      // --- Create Member 2: The Player ---
      Member member2 = new Member();
      member2.setEmail("bob@vinci.be");
      member2.setPassword("hashed_password_456");
      member2.setTag("BobTheBuilder");
      member2.setAdmin(false);
      member2.setDeleted(false);
      memberRepo.save(member2);

      // Create Notifications for Alice ---
      Notification notif1 = new Notification();
      notif1.setMember(member1);
      notif1.setContent("Welcome to the team, Alice!");
      notif1.setRead(false);
      notifsRepo.save(notif1);

      Notification notif2 = new Notification();
      notif2.setMember(member2);
      notif2.setContent("Your match result has been confirmed.");
      notif2.setRead(false);
      notifsRepo.save(notif2);

      // Create Notification for Bob ---
      Notification notif3 = new Notification();
      notif3.setMember(member2);
      notif3.setContent("New match challenge received!");
      notif3.setRead(false);
      notifsRepo.save(notif3);
    };
  }

}
