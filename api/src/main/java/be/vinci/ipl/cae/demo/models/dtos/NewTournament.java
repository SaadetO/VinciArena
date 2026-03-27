package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;

public record NewTournament(String name, String description, LocalDateTime startDate,
                            LocalDateTime endDate, int capacity,
                            LocalDateTime registrationDeadline) {

}
