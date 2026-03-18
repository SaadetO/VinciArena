package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NotificationDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.services.NotificationService;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
  public NotificationController(NotificationService notificationService,
      MemberRepository memberRepository) {
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
  @PreAuthorize("isAuthenticated()")
  public Iterable<NotificationDto> listNotifications(@PathVariable long id,
      @RequestParam(required = false, defaultValue = "false") boolean unreadOnly,
      @AuthenticationPrincipal Member currentMember) {
    verifyAccess(id, currentMember);
    return notificationService.getNotificationsByIdMember(id, unreadOnly);
  }

  /**
   * Route PATCH notifications/{id}/read.
   *
   * @param id id of the notification
   */
  @PatchMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("isAuthenticated()")
  public void markAsRead(@PathVariable long id, @AuthenticationPrincipal Member currentMember) {
    Optional<Notification> notification = notificationService.getById(id);
    if (notification.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    long idMember = notification.get().getMember().getIdMember();
    if (!Objects.equals(currentMember.getIdMember(), idMember)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    notificationService.markNotificationAsRead(id);
  }

  /**
   * Route GET /notifications/member/{id}/unread-count.
   *
   * @param id member id
   * @return nb of unread notifs
   */
  @GetMapping("/member/{id}/unread-count")
  @PreAuthorize("isAuthenticated()")
  public long countUnreadNotifications(@PathVariable long id,
      @AuthenticationPrincipal Member currentMember) {
    verifyAccess(id, currentMember);
    return notificationService.countUnreadNotifications(id);
  }


  private void verifyAccess(long id, Member currentMember) {
    if (currentMember == null || !Objects.equals(currentMember.getIdMember(), id)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
    if (!memberRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
  }
}