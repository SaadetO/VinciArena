package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for password update.
 */
@Getter
@Setter
@NoArgsConstructor
public class PasswordUpdateDto {
  private String password;
}
