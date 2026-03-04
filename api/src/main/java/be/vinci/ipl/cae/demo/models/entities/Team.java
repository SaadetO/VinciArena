package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Team entity.
 */
@Entity
@Table (name = "teams")
@Data
@NoArgsConstructor
public class Team {

}
