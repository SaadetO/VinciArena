package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Match entity.
 */
@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
public class Match {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idMatch;

  // Foreign Key to the Tournament
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_tournament", nullable = false)
  private Tournament tournament;

  // Nullable Foreign Key for Team 1
  @ManyToOne
  @JoinColumn(name = "id_team1")
  private Team team1;

  // Nullable Foreign Key for Team 2
  @ManyToOne
  @JoinColumn(name = "id_team2")
  private Team team2;

  @Column(nullable = false)
  private Integer turn;

  @Column(nullable = false)
  private LocalDateTime dateHour;

  // Enum mapped to String to save 'PLANIFIE' instead of 0
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MatchStatus status;

  // Nullable Foreign Key to the NEXT match (self-referencing)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_next_match")
  private Match nextMatch;

  @OneToMany(mappedBy = "match")
  private List<MatchLineup> lineups = new ArrayList<>();

}
