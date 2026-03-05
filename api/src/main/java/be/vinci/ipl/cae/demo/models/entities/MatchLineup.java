package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MatchLineup entity.
 */
@Entity
@Table(name = "matchs")
@Getter
@Setter
@NoArgsConstructor
public class MatchLineup {

  @EmbeddedId
  private MatchLineupId id = new MatchLineupId();

  @ManyToOne
  @MapsId("idMatch")
  @JoinColumn(name = "id_match")
  private Match match;

  @ManyToOne
  @MapsId("teamId")
  @JoinColumn(name = "id_team")
  private Team team;

  @Column(nullable = false)
  private boolean isRetreated = false;

}
