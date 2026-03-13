package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;

/**
 * DTO representing a notification.
 *
 * @param idNotification notification id
 * @param content message content
 * @param isRead read status
 * @param dateTime creation date
 */
public record NotificationDto(long idNotification, String content, boolean isRead,
                              LocalDateTime dateTime) {

}
