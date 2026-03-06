package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unavailability entity.
 */
@Entity
@Table(name = "unavailabilities")
@Data
@NoArgsConstructor
public class Unavailability {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idUnavailability;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_member")
  @JsonBackReference
  private Member member;

  @Column(nullable = false)
  private LocalDateTime startDate;

  @Column(nullable = false)
  private LocalDateTime endDate;

  /**
   *Hook that validates dates before inserting unavailability.
   */
  @PrePersist
  @PreUpdate
  public void validateDates() {
    if (startDate != null && endDate != null && !startDate.isBefore(endDate)) {
      throw new IllegalStateException("Start date must be before end date");
    }
  }
}
