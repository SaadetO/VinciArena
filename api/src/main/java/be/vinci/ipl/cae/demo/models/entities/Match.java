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
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "matchs")
@Getter
@Setter
@NoArgsConstructor
public class Match {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_match")
  private Long idMatch;

  // Foreign Key to the Tournament
  // @ManyToOne(fetch = FetchType.LAZY)
  // @JoinColumn(name = "tournament_id", nullable = false)
  // private Tournament tournoi;

  // Nullable Foreign Key for Team 1 (Circled in your image)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team1")
  private Team team1;

  // Nullable Foreign Key for Team 2 (Circled in your image)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team2")
  private Team team2;

  @Column(name = "turn", nullable = false)
  private Integer turn;

  @Column(name = "date_hour", nullable = false)
  private LocalDateTime dateHour;

  // Enum mapped to String to save 'PLANIFIE' instead of 0
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private MatchStatus status;

  // Nullable Foreign Key to the NEXT match (self-referencing)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "next_match")
  private Match nextMatch;

}
