export function asPercent(num) {
  if (!num) return '!OOPS! asPercent';
  return num.toLocaleString('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function asDecimal(num, precision = 1) {
  if (!num) return '!OOPS! asDecimal';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatPatchVersion(patch) {
  if (!patch) return;
  const p = patch.split('.');
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
    case wrDiff >= 0.02:
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

export function analyzePatchData(champions = {}, allReports = []) {
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
  const prevReport = allReports[1];

  const latest = currentReport.reduce((acc, curr) => {
    const key = `${curr.role}_${curr.championId}`;
    acc[key] = curr;
    return acc;
  }, {});
  const previous = prevReport.reduce((acc, curr) => {
    const key = `${curr.role}_${curr.championId}`;
    acc[key] = curr;
    return acc;
  }, {});

  const newChamps = [];
  const playrateJumps = [];
  const winrateJumps = [];
  const bigMovers = [];

  for (const champion of currentReport) {
    const key = `${champion.role}_${champion.championId}`;
    const champ = champs[champion.championId];
    const latestChamp = champion;
    const prevChamp = previous[key];

    if (latestChamp.pickRate < 0.005 || latestChamp.games < 50) continue;

    const playrate = latestChamp.pickRate;
    const winrate = latestChamp.wins / latestChamp.games;

    if (!prevChamp) {
      newChamps.push({
        ...champ,
        role: latestChamp.role,
        latest: {
          winrate,
          playrate,
        },
      });
      continue;
    }

    const playrateDiff = playrate - prevChamp.pickRate;
    const winrateDiff = winrate - prevChamp.wins / prevChamp.games;

    const hasSpikedInPlayrate = playrateDiff >= 0.075;
    const hasSpikedInWinrate = winrateDiff >= 0.03;

    const champEntry = {
      ...champ,
      role: latestChamp.role,
      playrateDiff,
      winrateDiff,
      latest: {
        winrate,
        playrate,
      },
      prev: {
        winrate: prevChamp.wins / prevChamp.games,
        playrate: latestChamp.games / latestChamp.totalGameCount,
      },
    };

    if (hasSpikedInPlayrate) {
      playrateJumps.push(champEntry);
    }

    if (hasSpikedInWinrate && winrate >= 0.49) {
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
