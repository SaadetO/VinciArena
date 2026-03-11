package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;

public record NotificationDto(long idNotification, String content, boolean isRead,
                              LocalDateTime dateTime) {

}
