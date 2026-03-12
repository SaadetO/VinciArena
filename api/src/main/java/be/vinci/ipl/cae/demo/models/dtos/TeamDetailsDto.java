package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.Builder;
import lombok.Data;

/**
 * TeamDetails DTO.
 */
@Data
@Builder
public class TeamDetailsDto {

  private Long idTeam;
  private String name;
  private boolean isActive;
  private List<ProfileDto> managers;
  private List<ProfileDto> members;
  private List<JoinRequestDto> joinRequests;

}
