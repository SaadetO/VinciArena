package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "matches_members")
@Getter
@Setter
@NoArgsConstructor
public class MatchMember {

  @EmbeddedId
  private MatchMemberId id = new MatchMemberId();

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("player")
  @JoinColumn(name = "player")
  private Member player;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("match")
  @JoinColumn(name = "match")
  private Match match;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("team")
  @JoinColumn(name = "team")
  private Team team;

}
