package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

/**
 * Profile DTO.
 */
@Data
@Builder
public class SpecialtyDto {
  private Long id;
  private String label;
}
