package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.MatchService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling match-related endpoints.
 */
@RestController
@RequestMapping("/matches")
public class MatchController {

  private final MatchService matchService;

  public MatchController(MatchService matchService){
    this.matchService = matchService;
  }



}