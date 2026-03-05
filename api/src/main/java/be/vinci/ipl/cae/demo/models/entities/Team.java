package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Team entity.
 */
@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
public class Team {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_team")
  private Long idTeam;

  @Column(unique = true, nullable = false)
  private String name;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  // Primary responsable Must be not null in order for team to be considered active.
  @ManyToOne
  @JoinColumn(name = "responsable1")
  private Member responsable1;

  // Secondary responsable (optional for team "active" status).
  @ManyToOne
  @JoinColumn(name = "responsable2")
  private Member responsable2;

  @ManyToMany
  @JoinTable(
      name = "tournament_registration",
      joinColumns = @JoinColumn(name = "id_team"),
      inverseJoinColumns = @JoinColumn(name = "id_tournament")
  )

  @JsonIgnore
  private List<Tournament> tournaments = new ArrayList<>();

  @OneToMany(mappedBy = "team")
  @JsonIgnore
  private List<Member> members = new ArrayList<>();

}
