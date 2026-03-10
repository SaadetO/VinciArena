package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Service class handling all notification-related business logic. Provides methods for individual,
 * group, and bulk notifications.
 */
@Service
public class NotificationService {

  private final MemberRepository memberRepository;
  private final NotificationRepository notificationRepository;

  /**
   * Constructs a new NotificationService with required repositories.
   *
   * @param memberRepository       the repository for member data
   * @param notificationRepository the repository for notification data
   */
  public NotificationService(MemberRepository memberRepository,
      NotificationRepository notificationRepository) {
    this.memberRepository = memberRepository;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Creates and saves a notification for a specific member identified by their ID.
   *
   * @param idMember the unique identifier of the member
   * @param content  the text message of the notification
   * @throws IllegalArgumentException if the member is not found or content is blank
   */
  public void notifyMember(Long idMember, String content) {

    Member member = memberRepository.findById(idMember)
        .orElseThrow(() -> new IllegalArgumentException("Member not found"));
    saveNotification(member, content);
  }

  /**
   * Sends a notification to all active members in the system.
   * Active members are those where isDeleted is false.
   *
   * @param content the text message of the notification
   */
  public void notifyAllMembers(String content) {
    Member[] activeMembers = memberRepository.getAllByIsDeleted(false);
    for (Member activeMember : activeMembers) {
      saveNotification(activeMember, content);
    }
  }

  /**
   * Sends a notification to every member currently belonging to a specific team.
   *
   * @param team    the team entity whose members will be notified
   * @param content the text message of the notification
   */
  public void notifyTeam(Team team, String content) {
    List<Member> teamMembers = team.getMembers();
    for (Member teamMember : teamMembers) {
      saveNotification(teamMember, content);
    }
  }

  /**
   * Sends a notification to the managers (responsables) of a team.
   * Only attempts to notify managers that are explicitly assigned (not null).
   *
   * @param team    the team whose managers will be notified
   * @param content the text message of the notification
   */
  public void notifyTeamManagers(Team team, String content) {
    Member manager1 = team.getManager1();
    Member manager2 = team.getManager2();
    if (manager1 != null) {
      saveNotification(manager1, content);
    }
    if (manager2 != null) {
      saveNotification(manager2, content);
    }
  }

  /**
   * Internal helper to persist a notification.
   *
   * @param member  the member entity to associate with the notification
   * @param content the message content
   * @throws IllegalArgumentException if content is null or blank
   */
  private void saveNotification(Member member, String content) {
    if (content == null || content.isBlank()) {
      throw new IllegalArgumentException("content must contain text");
    }
    Notification notification = new Notification();
    notification.setContent(content);
    notification.setMember(member);
    notificationRepository.save(notification);
  }

  /**
   * Retrieves notifications for a specific member, optionally filtering for unread ones.
   *
   * @param idMember   the unique identifier of the member
   * @param unreadOnly true to return only unread notifications, false for all
   * @return an iterable collection of notifications
   */
  public Iterable<Notification> getNotificationsByIdMember(long idMember, boolean unreadOnly) {
    if (unreadOnly) {
      return notificationRepository.findByMemberIdMemberAndIsReadFalse(idMember);
    }
    return notificationRepository.findByMemberIdMemberOrderByIsReadAscDateTimeDesc(idMember);
  }

  /**
   * Marks a specific notification as read.
   *
   * @param idNotification the unique identifier of the notification
   * @throws EntityNotFoundException if the notification does not exist
   */
  public void markNotificationAsRead(long idNotification) {
    Notification notification = notificationRepository.findById(idNotification).orElseThrow(
        () -> new EntityNotFoundException("Notification not found with id: " + idNotification));
    notification.setRead(true);
    notificationRepository.save(notification);
  }

  /**
   * Counts the number of unread notifications for a specific member.
   *
   * @param idMember the unique identifier of the member
   * @return the total count of unread notifications
   */
  public long countUnreadNotifications(long idMember) {
    return notificationRepository.countByMemberIdMemberAndIsReadFalse(idMember);
  }

  /**
   * Finds a specific notification by its identifier.
   *
   * @param idNotification the unique identifier of the notification
   * @return an Optional containing the notification if found, or empty otherwise
   */
  public Optional<Notification> getById(Long idNotification) {
    return notificationRepository.getNotificationByIdNotification(idNotification);
  }

}


