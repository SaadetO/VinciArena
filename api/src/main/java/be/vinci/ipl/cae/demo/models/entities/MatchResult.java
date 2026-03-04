package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
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

@Entity
@Table(name = "match_results")
@Getter
@Setter
@NoArgsConstructor
public class MatchResult {

  @Id
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  // @MapsId tells Spring: "The Primary Key of this table
  // is the exact same as the Match's Primary Key"
  @MapsId
  @JoinColumn(name = "match")
  private Match match;

  @Column(name = "confirmation_team1")
  private Boolean confirmationTeam1;

  @Column(name = "confirmation_team2")
  private Boolean confirmationTeam2;

  @Column(name = "score_team1", nullable = false)
  private Integer scoreTeam1;

  @Column(name = "score_team2", nullable = false)
  private Integer scoreTeam2;

}
