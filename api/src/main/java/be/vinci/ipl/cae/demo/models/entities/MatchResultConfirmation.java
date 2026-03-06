package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MatchResult entity.
 */
@Entity
@Table(name = "match_results")
@Getter
@Setter
@NoArgsConstructor
public class MatchResultConfirmation {

  @Id
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "match")
  private Match match;

  private Boolean confirmationTeam1;

  private Boolean confirmationTeam2;
}
