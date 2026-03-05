package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Member entity.
 */
@Entity
@Table(
    name = "members",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tag", "id_team"})
    }
)
@Data
@NoArgsConstructor
public class Member {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idMember;

  @Column(unique = true)
  private String email;

  private String password;

  private String tag;

  @ManyToOne
  @JoinColumn(name = "id_speciality")
  private Speciality speciality;

  private boolean isAdmin;

  @ManyToOne
  @JoinColumn(name = "id_team", nullable = true)
  private Team team;

  private LocalDateTime creationDate = LocalDateTime.now();

  @ManyToOne
  @JoinColumn(name = "id_profile_image")
  private ProfileImage profileImage;

  private boolean deleted;

}