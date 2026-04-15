package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import java.util.Set;
import java.util.stream.Collectors;

public record MatchLineupDto(
    Long matchId,
    Long teamId,
    String teamName,
    Set<MemberSummary> players
) {
  public record MemberSummary(Long id, String tag) {

  }
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
