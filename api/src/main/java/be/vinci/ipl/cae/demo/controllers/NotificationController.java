package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.services.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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

  /**
   * Constructor initializes notificationService.
   *
   * @param notificationService = service
   */
  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Route GET /notifications/member/:id.
   *
   * @param id = member ID
   * @return list of Notifications that belongs to the User
   */
  @GetMapping("/member/{id}")
  public Iterable<Notification> listNotifications(@PathVariable long id) {
    // TODO: Add authentification and authorization checks
    // TODO: check if member exists before fetching notifs
    return notificationService.getNotificationsByIdMember(id);
  }

  @PatchMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable long id) {
    // TODO: Add authentification and authorization checks
    boolean wasUpdated;
    try {
      notificationService.markNotificationAsRead(id);
    } catch (EntityNotFoundException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
  }
}