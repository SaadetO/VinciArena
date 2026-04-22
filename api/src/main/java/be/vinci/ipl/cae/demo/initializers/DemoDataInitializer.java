package be.vinci.ipl.cae.demo.initializers;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("demo")
public class DemoDataInitializer implements CommandLineRunner {

  @Override
  public void run(String... args) throws Exception {

  }
  // Jeu de données pour la démonstration finale face au client
}