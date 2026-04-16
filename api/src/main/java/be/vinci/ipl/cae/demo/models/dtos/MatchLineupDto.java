package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Data Transfer Object representing a team's lineup for a specific match.
 *
 * @param matchId  the unique identifier of the match
 * @param teamId   the unique identifier of the team
 * @param teamName the display name of the team
 * @param players  the set of members included in the lineup
 */
public record MatchLineupDto(
    Long matchId,
    Long teamId,
    String teamName,
    Set<MemberSummary> players
) {

  /**
   * Lightweight summary of a member for lineup display.
   *
   * @param id  the unique identifier of the member
   * @param tag the member's display tag
   */
  public record MemberSummary(Long id, String tag) {

  }

  /**
   * Creates a DTO from a MatchLineup entity.
   *
   * @param entity the entity to convert
   * @return a new MatchLineupDto populated with entity data
   */
  public static MatchLineupDto fromEntity(MatchLineup entity) {
    Set<MemberSummary> summaries = entity.getMembers().stream()
        .map(m -> new MemberSummary(m.getIdMember(), m.getTag()))
        .collect(Collectors.toSet());

    return new MatchLineupDto(
        entity.getMatch().getIdMatch(),
        entity.getTeam().getIdTeam(),
        entity.getTeam().getName(),
        summaries
    );
  }
}