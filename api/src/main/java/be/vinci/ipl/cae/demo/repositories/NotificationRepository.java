package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;

/**
 * Notification Repository.
 */
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Find Member by id.
   *
   * @param idMember id of the member
   * @return All notifications of the member
   */
  Iterable<Notification> findByMemberIdMember(Long idMember);
}
