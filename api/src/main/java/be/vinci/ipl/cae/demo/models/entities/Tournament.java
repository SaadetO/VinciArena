package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tournament table.
 */
@Entity
@Table(name = "tournaments")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tournament {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idTournament;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false)
  private LocalDate startDate;

  @Column(nullable = false)
  private LocalDate endDate;

  @Column(nullable = false)
  private LocalDate registrationDeadline;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TournamentStatus tournamentStatus = TournamentStatus.IN_PREPARATION;

  @Column(nullable = false)
  private int maxNbOfTeams;

  @ManyToMany
  @JoinTable(
      name = "tournament_registrations",
      joinColumns = @JoinColumn(name = "id_tournament"),
      inverseJoinColumns = @JoinColumn(name = "id_team")
  )
  private Set<Team> teams = new HashSet<>();

  /**
   * Set max number of teams for the current tournament.
   *
   * @param maxNbOfTeams max number of teams
   */
  public void setMaxNbOfTeams(int maxNbOfTeams) {
    if (maxNbOfTeams <= 0) {
      throw new IllegalArgumentException("Max teams must be > 0");
    }
    this.maxNbOfTeams = maxNbOfTeams;
  }

  /**
   * Validates the dates in the entity before inserting or updating any attributes.
   */
  @PrePersist
  @PreUpdate
  public void validateDates() {
    // check registrationDeadline is before startDate
    if (registrationDeadline != null && startDate != null) {
      if (!registrationDeadline.isBefore(startDate)) {
        throw new IllegalStateException("registrationDeadline must be before the startDate.");
      }
    }

    // Check startDate is before endDate
    if (startDate != null && endDate != null) {
      if (startDate.isAfter(endDate)) {
        throw new IllegalStateException("startDate must be before the endDate.");
      }
    }

    // Implied: registrationDeadline is before endDate
  }
}



