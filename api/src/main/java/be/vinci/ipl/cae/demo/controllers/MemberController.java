package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ProfileDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.services.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

  /**
   * Read one member's profile.
   *
   * @param id the ID of the requested member profile.
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
}
