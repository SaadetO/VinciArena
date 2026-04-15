package be.vinci.ipl.cae.demo.models.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record NewMatchLineupDto(
    @NotNull(message = "Player set cannot be null")
    @Size(max = 4, message = "Lineup cannot exceed 4 players")
    Set<Long> playerIds
) {
}