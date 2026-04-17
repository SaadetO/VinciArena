package be.vinci.ipl.cae.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main class of the application.
 */
@SpringBootApplication
@EnableScheduling
public class VinciArena {

  public static void main(String[] args) {
    SpringApplication.run(VinciArena.class, args);
  }
}