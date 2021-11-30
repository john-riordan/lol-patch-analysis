export const ENDPOINT_PATCHES =
  "https://league-champion-aggregate.iesdev.com/api/patches";
export const ENDPOINT_CHAMPIONS = (patch) => {
  return `http://ddragon.leagueoflegends.com/cdn/${patch}.1/data/en_US/champion.json`;
};
export const ENDPOINT_CHAMP_REPORT = (patch) => {
  const params = {
    region: "world",
    queue: 420,
    tier: "PLATINUM_PLUS",
    is_filtered_by_role: false,
    patch: patch,
  };
  const queryString = new URLSearchParams(params).toString();

  return `https://league-champion-aggregate.iesdev.com/api/champions?${queryString}`;
};
