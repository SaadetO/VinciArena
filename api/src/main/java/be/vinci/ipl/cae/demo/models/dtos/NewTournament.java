package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;

/**
 * New Tournament.
 *
 * @param name name of the tournament
 * @param description description of the tournament
 * @param startDate stratDate of the tournament
 * @param endDate endDate of the tournament
 * @param nbMaxOfTeams nbMaxOfTeams of the tournament
 * @param registrationDeadline registrationDeadline of the tournament
 */
public record NewTournament(String name, String description, LocalDate startDate,
                            LocalDate endDate, int nbMaxOfTeams,
                            LocalDate registrationDeadline) {

}
