package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Notification Service.
 */
@Service
public class NotificationService {

  private final MemberRepository memberRepository;
  private final NotificationRepository notificationRepository;
  private final TeamRepository teamRepository;

  /**
   * Creates the NotificationService.
   *
   * @param memberRepository       member repository
   * @param notificationRepository notification repository
   */
  public NotificationService(MemberRepository memberRepository,
      NotificationRepository notificationRepository,
      TeamRepository teamRepository) {
    this.memberRepository = memberRepository;
    this.notificationRepository = notificationRepository;
    this.teamRepository = teamRepository;
  }

  /**
   * Inserts new notification in to the db for one member.
   *
   * @param idMember = id of member who owns the notification
   * @param content  = text message that the notification contains
   * @return new Notification
   */
  public void notifyMember(Long idMember, String content) {
    if (content.isBlank()) {
      throw new IllegalArgumentException("content must contain text");
    }
    Member member = memberRepository.findById(idMember)
        .orElseThrow(() -> new IllegalArgumentException("Member not found"));

    Notification newNotification = new Notification();
    newNotification.setContent(content);
    newNotification.setMember(member);
    notificationRepository.save(newNotification);
  }

  /**
   * Inserts new notification in to the db for all the members isDeleted = false.
   *
   * @param content message of the notification
   */
  public void notifyAllMembers(String content) {
    Member[] activeMembers = memberRepository.getAllByIsDeleted(false);
    for (Member activeMember : activeMembers) {
      notifyMember(activeMember.getIdMember(), content);
    }
  }

  public void notifyTeam(Team team, String content) {
    List<Member> teamMembers = team.getMembers();
    for (Member teamMember : teamMembers) {
      notifyMember(teamMember.getIdMember(), content);
    }
  }

  public void notifyTeamManagers(Team team, String content) {
    Member manager1 = team.getManager1();
    Member manager2 = team.getManager2();
    if (manager1 != null) {
      notifyMember(manager1.getIdMember(), content);
    }
    if (manager2 != null) {
      notifyMember(manager2.getIdMember(), content);
    }
  }

  /**
   * Get a notification by its id.
   *
   * @param idMember id of the member
   * @return all the notification of a member
   */
  public Iterable<Notification> getNotificationsByIdMember(long idMember, boolean unreadOnly) {
    if (unreadOnly) {
      return notificationRepository.findByMemberIdMemberAndIsReadFalse(idMember);
    }
    return notificationRepository.findByMemberIdMemberOrderByIsReadAscDateTimeDesc(idMember);
  }

  /**
   * Mark a Notification as read.
   *
   * @param idNotification notification id
   */
  public void markNotificationAsRead(long idNotification) {
    Notification notification = notificationRepository.findById(idNotification).orElseThrow(
        () -> new EntityNotFoundException("Notification not found with id: " + idNotification));
    notification.setRead(true);
    notificationRepository.save(notification);
  }

  /**
   * calculates unread notifs.
   *
   * @param idMember = member ID
   * @return number of unread notification the member in question has
   */
  public long countUnreadNotifications(long idMember) {
    return notificationRepository.countByMemberIdMemberAndIsReadFalse(idMember);
  }

  public Optional<Notification> getById(Long idNotification) {
    return notificationRepository.getNotificationByIdNotification(idNotification);
  }

}


