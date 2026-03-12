package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewTeam;
import be.vinci.ipl.cae.demo.models.dtos.TeamDetailsDto;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.services.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * TeamController to handle team-related requests.
 */
@RestController
@RequestMapping("/teams")
public class TeamController {

  private final TeamService teamService;

  /**
   * Constructor for TeamController.
   *
   * @param teamService the injected TeamService.
   */
  public TeamController(TeamService teamService) {
    this.teamService = teamService;
  }

  /**
   * Create a new team. The authenticated member becomes the team's manager.
   *
   * @param newTeam       the team creation request body.
   * @param currentMember the authenticated member.
   * @return the created team.
   */
  @PostMapping("/")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("isAuthenticated()")
  public Team createTeam(@RequestBody NewTeam newTeam,
      @AuthenticationPrincipal Member currentMember) {
    if (newTeam == null
        || newTeam.getName() == null
        || newTeam.getName().isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    Team createdTeam = teamService.createTeam(newTeam.getName(), currentMember);

    if (createdTeam == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT);
    }

    return createdTeam;
  }

  /**
   * Get all active teams.
   *
   * @return an iterable of all active teams.
   */
  @GetMapping({"", "/"})
  public Iterable<Team> getAllActiveTeams() {
    return teamService.getAllActiveTeams();
  }

  /**
   * Get team details.
   *
   * @param id            the team ID
   * @param currentMember the current member
   * @return the team details
   */
  @GetMapping("/{id}/details")
  @PreAuthorize("isAuthenticated()")
  public TeamDetailsDto getTeamDetails(@PathVariable Long id,
      @AuthenticationPrincipal Member currentMember) {
    TeamDetailsDto teamDetails = teamService.getTeamDetails(id, currentMember);
    if (teamDetails == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return teamDetails;
  }
}
