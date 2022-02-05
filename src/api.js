export const GQL_URL = 'https://league-champion-aggregate.iesdev.com/graphql';
export const QUERY_AGG_STATS = `
  query ChampionStats($patch: String!) {
    allChampionStats(tier: PLATINUM_PLUS, patch: $patch, mostPopular: false) {
      championId
      role
      wins
      laneWins
      games
      kills
      deaths
      assists
      goldEarned
      magicDamageDealtToChampions
      physicalDamageDealtToChampions
      trueDamageDealtToChampions
      damageDealtToTurrets
      damageSelfMitigated
      firstBloodKill
      firstBloodAssist
      totalHealsOnTeammates
      totalTimeCcDealt
      totalGameCount
      pickRate
      patch
    }
  }
`;
export const requestPatchData = patch => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: QUERY_AGG_STATS,
    variables: {
      patch: patch,
    },
  }),
});
