package be.vinci.ipl.cae.demo.initializers;

import be.vinci.ipl.cae.demo.models.entities.Match;
import be.vinci.ipl.cae.demo.models.entities.MatchLineup;
import be.vinci.ipl.cae.demo.models.entities.Member;
import be.vinci.ipl.cae.demo.models.entities.ProfileImage;
import be.vinci.ipl.cae.demo.models.entities.Specialty;
import be.vinci.ipl.cae.demo.models.entities.Team;
import be.vinci.ipl.cae.demo.models.entities.Tournament;
import be.vinci.ipl.cae.demo.models.entities.TournamentStatus;
import be.vinci.ipl.cae.demo.repositories.MatchLineupRepository;
import be.vinci.ipl.cae.demo.repositories.MemberRepository;
import be.vinci.ipl.cae.demo.repositories.ProfileImageRepository;
import be.vinci.ipl.cae.demo.repositories.SpecialtyRepository;
import be.vinci.ipl.cae.demo.repositories.TeamRepository;
import be.vinci.ipl.cae.demo.repositories.TournamentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 * Utility class to share initialization logic and mock data.
 */
public final class InitializerUtils {

  private InitializerUtils() {
    // Private constructor prevents instantiation
  }


  public record MemberMockData(String email, String tag, String specialty, String creationDate,
                               boolean isAdmin, boolean isManager, String teamName) {

  }

  public record TournamentMockData(String name, String description, String start, String end,
                                   String deadline, int capacity, int teamCount,
                                   String winnerTeamName, TournamentStatus status) {

  }


  /**
   * Initializes specialties and profile images.
   */
  public static Map<String, Specialty> initializeBasics(SpecialtyRepository specRepo,
      ProfileImageRepository imageRepo) {
    String[] specialities = {"architecte", "exécuteur", "tacticien", "gardien", "catalyseur",
        "perturbateur", "guérisseur"};
    Map<String, Specialty> specMap = new HashMap<>();
    for (String s : specialities) {
      Specialty spec = new Specialty();
      spec.setName(s);
      specMap.put(s, specRepo.save(spec));
    }

    for (int i = 1; i <= 20; i++) {
      ProfileImage image = new ProfileImage();
      image.setPath("profile-" + i + ".png");
      imageRepo.save(image);
    }
    return specMap;
  }

  /**
   * Creates members and their associated teams.
   */
  public static void createMembers(MemberMockData[] dataList, String encodedPw,
      Map<String, Specialty> specMap, Map<String, Team> teamMap, MemberRepository memberRepo,
      TeamRepository teamRepo, ProfileImageRepository imageRepo) {
    for (int i = 0; i < dataList.length; i++) {
      MemberMockData data = dataList[i];

      Team team = teamMap.computeIfAbsent(data.teamName(), name -> {
        Team t = new Team();
        t.setName(name);
        t.setIsActive(true);
        return teamRepo.save(t);
      });

      Member member = new Member();
      member.setEmail(data.email());
      member.setPassword(encodedPw);
      member.setTag(data.tag());
      member.setCreationDate(LocalDate.parse(data.creationDate()).atStartOfDay());
      member.setAdmin(data.isAdmin());
      member.setDeleted(false);
      member.setSpecialty(specMap.get(data.specialty()));
      member.setProfileImage(imageRepo.getProfileImageByIdImage((long) ((i % 20) + 1)));
      member.setTeam(team);
      team.getMembers().add(member);
      member = memberRepo.save(member);

      if (data.isManager()) {
        if (team.getManager1() == null) {
          team.setManager1(member);
        } else if (team.getManager2() == null) {
          team.setManager2(member);
        }
        teamRepo.save(team);
      }
    }
  }

  /**
   * Creates tournaments and fills them with a pool of teams.
   */
  public static void createTournaments(TournamentMockData[] dataList, Map<String, Team> teamMap,
      List<Team> poolOfTeams, TournamentRepository tournamentRepo) {
    for (TournamentMockData data : dataList) {
      Tournament t = new Tournament();
      t.setName(data.name());
      t.setDescription(data.description());
      t.setStartDate(LocalDate.parse(data.start()));
      t.setEndDate(LocalDate.parse(data.end()));
      t.setRegistrationDeadline(LocalDateTime.parse(data.deadline()));
      t.setCapacity(data.capacity());
      t.setStatus(data.status());
      t.setWinner(teamMap.get(data.winnerTeamName()));

      List<Team> registered = new ArrayList<>();
      for (int i = 0; i < data.teamCount() && i < poolOfTeams.size(); i++) {
        registered.add(poolOfTeams.get(i));
      }

      if (t.getWinner() != null && !registered.contains(t.getWinner())) {
        registered.add(t.getWinner());
      }

      t.setTeams(registered);
      tournamentRepo.save(t);
    }
  }

  /**
   * Completes the registration of a tournament using a pool of ghost teams.
   *
   * @param tournament tournament
   * @param ghostPool pool of ghost teams
   * @param totalTeamsTarget number of registered teams
   * @param tournamentRepo tournament repository
   */
  public static void completeTournamentRegistration(Tournament tournament, List<Team> ghostPool,
      int totalTeamsTarget, TournamentRepository tournamentRepo) {
    // Get the teams already registered (the ones you manually added)
    List<Team> registered = new ArrayList<>(tournament.getTeams());

    // Calculate how many more we need
    int remainingSlots = totalTeamsTarget - registered.size();

    if (remainingSlots > 0) {
      for (int i = 0; i < remainingSlots && i < ghostPool.size(); i++) {
        Team ghost = ghostPool.get(i);
        // Avoid duplicates just in case
        if (!registered.contains(ghost)) {
          registered.add(ghost);
        }
      }
    }

    tournament.setTeams(registered);
    tournamentRepo.save(tournament);
  }

  /**
   * Creates empty match lineup.
   *
   * @param match match
   * @param team team
   * @param matchLineupRepo match lineup repository
   */
  public static void createEmptyMatchLineup(Match match, Team team,
      MatchLineupRepository matchLineupRepo) {
    MatchLineup lineup = new MatchLineup();
    lineup.setMatch(match);
    lineup.setTeam(team);
    lineup.setMembers(new HashSet<>());
    matchLineupRepo.save(lineup);
  }
}
