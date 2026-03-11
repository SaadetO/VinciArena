package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.RequestStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

/**
 * JoinRequest DTO.
 */
@Data
@Builder
public class JoinRequestDto {

  Long idJoinRequest;
  Long idTeam;
  String teamName;
  RequestStatus status;
  LocalDateTime expirationDate;

}
