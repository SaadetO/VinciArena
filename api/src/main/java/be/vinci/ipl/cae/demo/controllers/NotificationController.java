package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.services.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Notifications Controller.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService notificationService;
  private final MemberRepository memberRepository;

  /**
   * Constructor initializes notificationService.
   *
   * @param notificationService = service
   */
  public NotificationController(
      NotificationService notificationService,
      MemberRepository memberRepository
  ) {
    this.notificationService = notificationService;
    this.memberRepository = memberRepository;
  }

  /**
   * Route GET /notifications/member/{id}.
   *
   * @param id = member ID
   * @return list of Notifications that belongs to the User
   */
  @GetMapping("/member/{id}")
  public Iterable<Notification> listNotifications(@PathVariable long id,
      @RequestParam(required = false, defaultValue = "false") boolean unreadOnly) {
    // TODO: Add authentification and authorization checks
    if (!memberRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return notificationService.getNotificationsByIdMember(id, unreadOnly);
  }

  /**
   * Route PATCH notifications/{id}/read.
   *
   * @param id id of the notification
   */
  @PatchMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable long id) {
    // TODO: Add authentification and authorization checks
    try {
      notificationService.markNotificationAsRead(id);
    } catch (EntityNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * route GET /notifications/member/{id}/unread-count.
   *
   * @param id = member Id
   * @return nb of unread notifs
   */
  @GetMapping("/member/{id}/unread-count")
  public long countUnreadNotifications(@PathVariable long id) {
    if (!memberRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return notificationService.countUnreadNotifications(id);
  }
}