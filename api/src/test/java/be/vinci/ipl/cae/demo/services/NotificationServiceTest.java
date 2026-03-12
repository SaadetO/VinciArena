package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Notification;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.NotificationRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock
  private NotificationRepository notificationRepository;
  @Mock
  private MemberRepository memberRepository;
  @InjectMocks
  private NotificationService notificationService;

  // 1. YOUR HELPER FOR REUSABLE ASSERTIONS
  private void assertSavedNotification(Notification captured, Member expectedMember,
      String expectedContent) {
    assertEquals(expectedMember, captured.getMember());
    assertEquals(expectedContent, captured.getContent());
  }

  @Test
  @DisplayName("Should notify member with correct data")
  void notifyMember_Success() {
    Long memberId = 1L;
    Member mockMember = new Member();
    mockMember.setIdMember(memberId);
    when(memberRepository.findById(memberId)).thenReturn(Optional.of(mockMember));
    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);

    notificationService.notifyMember(memberId, "hi");

    verify(notificationRepository).save(captor.capture());
    assertSavedNotification(captor.getValue(), mockMember, "hi"); // Use the helper!
  }

  @Test

  @DisplayName("Should throw IllegalArgumentException when member ID does not exist")
  void notifyMember_MemberNotFound() {

    when(memberRepository.findById(999L)).thenReturn(Optional.empty());
    assertThrows(IllegalArgumentException.class,
        () -> notificationService.notifyMember(999L, "hi"));


  }

  @Test
  @DisplayName("Should notify all members with correct data")
  void notifyAllMembers_Success() {
    Member m1 = new Member();
    m1.setIdMember(1L);
    Member m2 = new Member();
    m2.setIdMember(2L);
    when(memberRepository.getAllByIsDeleted(false)).thenReturn(new Member[]{m1, m2});
    ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);

    notificationService.notifyAllMembers("hi everyone");

    verify(notificationRepository, times(2)).save(captor.capture());
    assertSavedNotification(captor.getAllValues().get(0), m1, "hi everyone");
    assertSavedNotification(captor.getAllValues().get(1), m2, "hi everyone");
  }

  @Test
  @DisplayName("Should not call save when there are no active members")
  void notifyAllMembers_EmptyList() {
    // Arrange
    when(memberRepository.getAllByIsDeleted(false)).thenReturn(new Member[0]);
    // Act
    notificationService.notifyAllMembers("Hi");
    // Assert
    verify(notificationRepository, never()).save(any());
  }
}