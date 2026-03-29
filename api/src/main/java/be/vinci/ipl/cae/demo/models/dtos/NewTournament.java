package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;

/**
 * DTO used to create a new tournament.
 */
public record NewTournament(String name, String description, LocalDate startDate,
                            LocalDate endDate, int nbMaxOfTeams,
                            LocalDate registrationDeadline) {

}
