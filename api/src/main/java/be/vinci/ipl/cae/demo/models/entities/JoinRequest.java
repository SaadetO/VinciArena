package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "join_requests")
@Data
@NoArgsConstructor
public class JoinRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idJoinRequest;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name= "id_team")
  @JsonBackReference
  private Team requestedTeam;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_member")
  @JsonBackReference
  private Member member;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RequestStatus status = RequestStatus.PENDING; //default value

  @Column(nullable = true)
  private String rejectionReason;

  @Column(nullable = false)
  private LocalDateTime expirationDate;

  @Column(nullable = false)
  private LocalDateTime requestDate;

}
