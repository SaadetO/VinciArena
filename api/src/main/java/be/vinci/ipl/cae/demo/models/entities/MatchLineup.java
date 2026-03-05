package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//corresponds to "compositions_equipes_match" table on the DSD
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
  @JoinColumn(name="id_match")
  private Match match;

@ManyToOne
@MapsId("memberId")
@JoinColumn(name="id_member")
private Member member;

@Column(nullable = false)
private boolean isRetreated = false;

}
