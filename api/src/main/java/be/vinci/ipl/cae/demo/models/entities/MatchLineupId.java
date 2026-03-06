package be.vinci.ipl.cae.demo.models.entities;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MatchLineupId id.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchLineupId implements Serializable {

  private Long idMatch;
  private Long idTeam;

}
