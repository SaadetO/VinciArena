package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new unavailability.
 */
@Data
@NoArgsConstructor
public class NewUnavailabilityDto {

  private LocalDateTime startDate;
  private LocalDateTime endDate;
}
