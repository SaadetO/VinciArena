package be.vinci.ipl.cae.demo.repositories;


import be.vinci.ipl.cae.demo.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;

public interface NotificationRepository extends CrudRepository<Notification, Long> {

  Iterable<Notification> findByMember();
}
