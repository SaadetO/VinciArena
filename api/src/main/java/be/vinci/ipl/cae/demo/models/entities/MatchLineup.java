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
@Table(name = "matchs")
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
  @MapsId("teamId")
  @JoinColumn(name = "id_team")
  private Team team;

  @Column(nullable = false)
  private boolean isRetreated = false;

  @ManyToMany
  @JoinTable(name = "match_members", joinColumns = @JoinColumn(name = "match_lineup_id"), inverseJoinColumns = @JoinColumn(name = "Member_id"))
  private Set<Member> members = new HashSet<>();

  /*
  Adds member to the lineup only if there are less than 4 members in it.
  Returns false if member wasn't added
   */
  boolean addMember(Member member) {
    if (this.members.size() < 4) {
      members.add(member);
      return true;
    }
    return false;
  }
}
