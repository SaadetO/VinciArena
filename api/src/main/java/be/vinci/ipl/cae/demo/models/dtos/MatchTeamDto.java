package be.vinci.ipl.cae.demo.models.dtos;

/**
 * Match Team DTO including result information.
 */
public record MatchTeamDto(
    Long idTeam,
    String name,
    Integer score,
    boolean isWinner,
    boolean hasForfeited
) {}
