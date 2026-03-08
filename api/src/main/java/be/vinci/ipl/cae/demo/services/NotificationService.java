package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import org.springframework.stereotype.Service;

/**
 * Notification Service.
 */
@Service
public class NotificationService {

  private final MemberRepository memberRepository;
  private final NotificationRepository notificationRepository;

  /**
   * Creates the NotificationService.
   *
   * @param memberRepository member repository
   * @param notificationRepository notification repository
   */
  public NotificationService(MemberRepository memberRepository,
      NotificationRepository notificationRepository) {
    this.memberRepository = memberRepository;
    this.notificationRepository = notificationRepository;
  }

  /**
   * Inserts new notification in to the db.
   *
   * @param idMember = id of member who owns the notification
   * @param content  = text message that the notification contains
   * @return new Notification
   */
  public Notification createNotification(Long idMember, String content) {
    if (content.isBlank()) {
      throw new IllegalArgumentException("content must contain text");
    }
    Member member = memberRepository.findById(idMember)
        .orElseThrow(() -> new IllegalArgumentException("Member not found"));

    Notification newNotification = new Notification();
    newNotification.setContent(content);
    newNotification.setMember(member);
    return notificationRepository.save(newNotification);
  }

  /**
   * Get a notification by its id.
   *
   * @param idMember id of the member
   * @return all the notification of a member
   */
  public Iterable<Notification> getNotificationsByIdMember(long idMember) {
    return notificationRepository.findByMemberIdMember(idMember);
  }

}
