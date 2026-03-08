package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileDto {
  private Long id;
  private String email;          // NULL if not owner
  private String tag;
  private String specialty;
  private LocalDateTime creationDate; // NULL if not owner, but using string in frontend. DTO can be JSON serialized.
  private String avatar;
  private Boolean isAdmin;       // NULL if not owner
  private TeamDto team;
  private List<UnavailabilityDto> unavailabilities; // NULL if not owner

  @Data
  @Builder
  public static class TeamDto {
    private Long id;
    private String name;
    private boolean isManager;
  }

  @Data
  @Builder
  public static class UnavailabilityDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
  }
}
