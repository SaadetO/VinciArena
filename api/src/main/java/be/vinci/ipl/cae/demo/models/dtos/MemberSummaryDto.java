package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Builder;
import lombok.Data;

/**
 * A lightweight member DTO exposed to any authenticated user. Contains only tag, specialty and
 * profile image — no sensitive data like email.
 */
@Data
@Builder
public class MemberSummaryDto {
  private Long id;
  private String tag;
  private String specialty;
  private String avatar;
}
