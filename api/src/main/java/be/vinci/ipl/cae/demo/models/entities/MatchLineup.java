package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MatchLineup entity.
 */
@Entity
@Table(name = "match_lineups")
@Getter
@Setter
@NoArgsConstructor
public class MatchLineup {

  @EmbeddedId
  private MatchLineupId id = new MatchLineupId();

  @ManyToOne
  @MapsId("idMatch")
  @JoinColumn(name = "id_match")
  private Match match;

  @ManyToOne
  @MapsId("idTeam")
  @JoinColumn(name = "id_team")
  private Team team;

  @Column(nullable = false)
  private boolean isRetreated = false;

  @Column(nullable = true)
  private int score;

  @Column(nullable = true)
  private boolean isWinner;

  @ManyToMany
  @JoinTable(name = "match_members", joinColumns = {
      @JoinColumn(name = "id_match", referencedColumnName = "id_match"),
      @JoinColumn(name = "id_team",
          referencedColumnName = "id_team")}, inverseJoinColumns = @JoinColumn(name = "id_membre"))
  private Set<Member> members = new HashSet<>();

  /**
   * Adds member to lineup.
   *
   * @param member member being added to the lineup
   * @return true if member added , false if not
   */
  public boolean addMember(Member member) {
    if (this.members.size() < 4) {
      members.add(member);
      return true;
    }
    return false;
  }
}
