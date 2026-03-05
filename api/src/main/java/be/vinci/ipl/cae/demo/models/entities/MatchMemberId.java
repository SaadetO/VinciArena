package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MatchMemberId id.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class MatchMemberId implements Serializable {

  @Column(name = "player")
  private Long player;

  @Column(name = "match")
  private Long match;

  @Column(name = "team")
  private Long team;

}
