export function asPercent(num) {
  if (!num) return "!OOPS! asPercent";
  return num.toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatPatchVersion(patch) {
  const p = patch.split(".");
  const major = p[0];
  const minor = p[1];

  return `${major}.${minor}`;
}

export function wrDiffColor(wrDiff) {
  const color = {
    h: 205,
    s: 100,
    l: 64,
    a: 1,
  };

  switch (true) {
    case wrDiff >= 0.08:
      color.s = 100;
      break;
    case wrDiff >= 0.05:
      color.s = 45;
      color.l = 55;
      break;
    case wrDiff >= 0.03:
      color.s = 25;
      color.l = 55;
      break;
    case wrDiff >= -0.015:
      color.h = 0;
      color.s = 25;
      color.l = 67;
      break;
    case wrDiff >= -0.035:
      color.h = 0;
      color.s = 55;
      color.l = 67;
      break;
    case wrDiff <= 0:
      color.h = 0;
      color.s = 100;
      color.l = 67;
      break;
    default:
      color.s = 0;
      break;
  }

  return `hsl(${color.h}deg ${color.s}% ${color.l}% / ${color.a})`;
}

export function prDiffColor(prDiff) {
  const color = {
    h: 205,
    s: 100,
    l: 70,
    a: 1,
  };

  switch (true) {
    case prDiff >= 0.2:
      color.s = 100;
      break;
    case prDiff >= 0.15:
      color.s = 75;
      color.l = 60;
      break;
    case prDiff >= 0.1:
      color.s = 55;
      color.l = 55;
      break;
    case prDiff >= 0.05:
      color.s = 45;
      color.l = 45;
      break;
    case prDiff >= 0.025:
      color.s = 35;
      color.l = 45;
      break;
    case prDiff >= 0.001:
      color.s = 15;
      color.l = 35;
      break;
    case prDiff >= -0.01:
      color.h = 0;
      color.s = 20;
      color.l = 67;
      break;
    case prDiff >= -0.05:
      color.h = 0;
      color.s = 40;
      color.l = 67;
      break;
    case prDiff <= 0:
      color.h = 0;
      color.s = 100;
      color.l = 67;
      break;
    default:
      color.s = 0;
      break;
  }

  return `hsl(${color.h}deg ${color.s}% ${color.l}% / ${color.a})`;
}

export function analyzePatchData(
  champions = {},
  latestPatch = [],
  previousPatch = []
) {
  const champs = Object.values(champions).reduce((acc, curr) => {
    const { key, id, name, image } = curr;
    acc[key] = {
      id: key,
      key: id,
      name,
      image: `https://blitz-cdn.blitz.gg/blitz/lol/champion/${id}.webp`,
    };
    return acc;
  }, {});
  const latest = latestPatch.reduce((acc, curr) => {
    const key = `${curr.role}_${curr.champion_id}`;
    acc[key] = curr;
    return acc;
  }, {});
  const previous = previousPatch.reduce((acc, curr) => {
    const key = `${curr.role}_${curr.champion_id}`;
    acc[key] = curr;
    return acc;
  }, {});

  const newChamps = [];
  const playrateJumps = [];
  const winrateJumps = [];
  const bigMovers = [];

  for (const champion of latestPatch) {
    const key = `${champion.role}_${champion.champion_id}`;
    const champ = champs[champion.champion_id];
    const latestChamp = champion;
    const prevChamp = previous[key];

    // Minimum of 5% role percentage AND 100 games
    if (
      latestChamp.stats.role_percentage <= 0.05 ||
      latestChamp.stats.games <= 100
    ) {
      continue;
    }

    if (!prevChamp) {
      newChamps.push({
        ...champ,
        role: latestChamp.role,
      });
      continue;
    }

    const playrateDiff =
      latestChamp.stats.role_percentage - prevChamp.stats.role_percentage;
    const winrateDiff =
      latestChamp.stats.wins / latestChamp.stats.games -
      prevChamp.stats.wins / prevChamp.stats.games;

    const hasSpikedInPlayrate = playrateDiff >= 0.05;
    const hasSpikedInWinrate = winrateDiff >= 0.03;

    const champEntry = {
      ...champ,
      role: latestChamp.role,
      playrateDiff,
      winrateDiff,
      latest: {
        winrate: latestChamp.stats.wins / latestChamp.stats.games,
        rolePercent: latestChamp.stats.role_percentage,
      },
      prev: {
        winrate: prevChamp.stats.wins / prevChamp.stats.games,
        rolePercent: prevChamp.stats.role_percentage,
      },
    };

    if (hasSpikedInPlayrate) {
      playrateJumps.push(champEntry);
    }

    if (hasSpikedInWinrate) {
      winrateJumps.push(champEntry);
    }

    if (hasSpikedInPlayrate && hasSpikedInWinrate) {
      bigMovers.push(champEntry);
    }
  }

  return {
    newChamps,
    playrateJumps: playrateJumps.sort(
      (a, z) => z.playrateDiff - a.playrateDiff
    ),
    winrateJumps: winrateJumps.sort((a, z) => z.winrateDiff - a.winrateDiff),
    bigMovers,
  };
}

export function buildChampionsList(champions = {}, allReports = []) {
  const champs = Object.values(champions).reduce((acc, curr) => {
    const { key, id, name, image } = curr;
    acc[key] = {
      id: key,
      key: id,
      name,
      image: `https://blitz-cdn.blitz.gg/blitz/lol/champion/${id}.webp`,
    };
    return acc;
  }, {});

  const currentReport = allReports[0];
  const prevReports = allReports.slice(1);

  const champList = [];

  for (const champion of currentReport) {
    const { stats, champion_id, role, total_game_count } = champion;
    const champInfo = champs[champion_id];

    const patches = {};
    patches[champion.patch] = {
      patch: champion.patch,
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      kda: (stats.kills + stats.assists) / stats.deaths,
      games: stats.games,
      wins: stats.wins,
      laneWins: stats.lane_wins,
      winrate: stats.wins / stats.games,
      laneWinrate: stats.lane_wins / stats.games,
      playrate: stats.games / total_game_count,
    };

    for (const report of prevReports) {
      const prevChamp = report.find(
        (c) => c.champion_id === champion_id && c.role === role
      );

      if (prevChamp) {
        const { stats, total_game_count } = prevChamp;
        patches[prevChamp.patch] = {
          patch: prevChamp.patch,
          kills: stats.kills,
          deaths: stats.deaths,
          assists: stats.assists,
          kda: (stats.kills + stats.assists) / stats.deaths,
          games: stats.games,
          wins: stats.wins,
          laneWins: stats.lane_wins,
          winrate: stats.wins / stats.games,
          laneWinrate: stats.lane_wins / stats.games,
          playrate: stats.games / total_game_count,
        };
      }
    }

    champList.push({
      champInfo,
      champion_id,
      role,
      patches,
    });
  }

  return champList;
}
