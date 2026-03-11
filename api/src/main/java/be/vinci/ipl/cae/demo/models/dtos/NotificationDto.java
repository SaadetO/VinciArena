package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;

public class NotificationDto {

  private long idNotification;
  private String content;
  private boolean isRead;
  private LocalDateTime dateTime;

  public NotificationDto(long idNotification, String content, boolean isRead,
      LocalDateTime dateTime) {
    this.idNotification = idNotification;
    this.content = content;
    this.isRead = isRead;
    this.dateTime = dateTime;
  }

}
