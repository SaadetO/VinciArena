package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewMember DTO.
 */
@Data
@NoArgsConstructor
public class NewMember {

  private String email;
  private String password;
  private String tag;
  private Long specialtyId;
  private Long profileImageId;

}
