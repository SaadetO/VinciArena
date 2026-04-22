package be.vinci.ipl.cae.demo.initializers;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class TestDataInitializer implements CommandLineRunner {

  @Override
  public void run(String... args) throws Exception {

  }
  // Jeu de données pour les tests automatisés
}
