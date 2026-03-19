package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.PasswordUpdateDto;
import be.vinci.ipl.cae.demo.models.dtos.ProfileDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.services.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller to handle member/profile queries.
 */
@RestController
@RequestMapping("/members")
public class MemberController {

  private final MemberService memberService;

  /**
   * Constructor for MemberController.
   *
   * @param memberService the injected MemberService.
   */
  public MemberController(MemberService memberService) {
    this.memberService = memberService;
  }

  @PreAuthorize("isAuthenticated()")
  @GetMapping("/full")
  public Member[] getAllMembers(@AuthenticationPrincipal Member currentMember) {
    if (!currentMember.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    return memberService.getAllMembers();
  }

  /**
   * Read one member's profile.
   *
   * @param id            the ID of the requested member profile.
   * @param currentMember the currently authenticated member (can be null if not logged in).
   * @return the profile information (filtered based on privacy rules).
   */
  @GetMapping("/{id}")
  public ProfileDto readOne(@PathVariable Long id, @AuthenticationPrincipal Member currentMember) {
    String authenticatedEmail = currentMember != null ? currentMember.getEmail() : null;
    ProfileDto profile = memberService.getProfile(id, authenticatedEmail);

    if (profile == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  /**
   * Update a member's password.
   *
   * @param passwordDto   the new password DTO.
   * @param currentMember the currently authenticated member.
   */
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/me/password")
  public void updatePassword(
      @RequestBody PasswordUpdateDto passwordDto,
      @AuthenticationPrincipal Member currentMember) {

    if (passwordDto == null
        || passwordDto.getPassword() == null
        || passwordDto.getPassword().trim().isEmpty()
    ) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password cannot be empty");
    }

    boolean updated = memberService.updatePassword(currentMember, passwordDto.getPassword());
    if (!updated) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Update a member's profile image.
   *
   * @param profileImage  the new profile image entity
   * @param currentMember the currently authenticated member
   */
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/me/avatar")
  public void updateAvatar(
      @RequestBody ProfileImage profileImage,
      @AuthenticationPrincipal Member currentMember) {

    boolean updated = memberService.updateAvatar(currentMember, profileImage);
    if (!updated) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile image");
    }
  }

  /**
   * Updates the isAdmin property. (we assume we want to change it so we toggle it since it's a
   * boolean)
   *
   * @param id            id of the target member
   * @param currentMember authenticated member
   */
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}/admin")
  public void toggleAdmin(@PathVariable Long id, @AuthenticationPrincipal Member currentMember) {
    if (!currentMember.isAdmin()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    if (currentMember.getIdMember().equals(id)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "You cannot change your own admin status"
      );
    }
    boolean updated = memberService.toggleAdmin(id);
    if (!updated) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
  }
}
