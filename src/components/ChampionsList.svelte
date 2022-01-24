<script>
  import { asPercent, asDecimal } from '../helpers';
  export let data;

  const roles = ['ALL', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const stats = ['winrate', 'laneWinrate', 'kda', 'playrate'];

  let selectedStat = stats[0];
  let onlyCommon = false;
  let selectedRole = roles[0];

  let search = '';

  $: highestSelected = data.bounds.highest[selectedStat];
  $: lowestSelected = data.bounds.lowest[selectedStat];
  $: normSelected = highestSelected - lowestSelected;
  $: playPercent = onlyCommon ? 400 : 0;
  $: list = data.champList
    .filter(
      c =>
        c.patches[0].games >= playPercent &&
        (c.role === selectedRole || selectedRole === 'ALL') &&
        c.champInfo.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, z) => z.patches[0][selectedStat] - a.patches[0][selectedStat]);
</script>

{#each stats as stat}
  <button
    on:click={() => (selectedStat = stat)}
    class:active={selectedStat === stat}>{stat}</button
  >
{/each}
{#each roles as role}
  <button
    on:click={() => (selectedRole = role)}
    class:active={selectedRole === role}>{role}</button
  >
{/each}
<label>
  Only show common picks
  <input type="checkbox" bind:checked={onlyCommon} />
</label>
<input type="text" bind:value={search} />

<div class="container">
  <div class="header">
    <p class="info" />
    <p class="type-caption wr">Win-Rate</p>
    <p class="type-caption wr">Lane Win-Rate</p>
    <p class="type-caption wr">KDA</p>
    <p class="type-caption wr">Play-Rate</p>
    <div class="bars" />
  </div>
  <ol>
    {#each list as champion, i}
      <li>
        <span class="type-overline">{i + 1}</span>
        <div class="champion-info info">
          <img
            src={champion.champInfo.image}
            loading={i > 15 ? 'lazy' : 'eager'}
            alt={champion.champInfo.name}
            width="40"
            height="40"
          />
          <div>
            <p class="type-subtitle2">{champion.champInfo.name}</p>
            <p class="type-overline">{champion.role}</p>
          </div>
        </div>

        <p class="type-caption wr">{asPercent(champion.patches[0].winrate)}</p>
        <p class="type-caption wr">
          {asPercent(champion.patches[0].laneWinrate)}
        </p>
        <p class="type-caption wr">{asDecimal(champion.patches[0].kda)}</p>
        <p class="type-caption wr">{asPercent(champion.patches[0].playrate)}</p>

        <div class="bars">
          {#each [...champion.patches].reverse() as patch}
            <div
              class="bar"
              style={`--h: ${
                (patch[selectedStat] - lowestSelected) / normSelected
              }`}
              data-val={patch[selectedStat]}
            />
          {/each}
        </div>
      </li>
    {/each}
  </ol>
</div>

<style lang="scss">
  .container {
    max-width: 1000px;
    margin-inline: auto;
  }
  button {
    position: relative;
    background: transparent;
    border: none;
    color: var(--shade2);
    font-family: Inter, Arial, Helvetica, sans-serif;
    height: var(--sp-11);
    min-width: 7ch;
    padding: 0 var(--sp-3);
    cursor: pointer;

    &:hover {
      color: var(--shade0);
    }
    &.active {
      color: var(--shade0);
      background: hsla(var(--shade5-hsl) / 0.25);
      border-radius: var(--br);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 20%;
        width: var(--sp-6);
        height: 2px;
        background: var(--primary);
        border-radius: var(--br-sm) var(--br-sm) 0 0;
        transform: translateX(-50%);
      }
    }
  }
  .info {
    flex: 2;
  }
  .wr {
    flex: 1;
    text-align: center;
  }

  ol {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .header {
    height: 4rem;
  }
  .header,
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  img {
    margin-right: 0.5rem;
  }
  .champion-info {
    display: flex;
    align-items: center;
  }
  .bars {
    display: flex;
    align-items: stretch;
    gap: 0.25rem;
    height: 30px;
    width: 5rem;
  }
  .bar {
    position: relative;
    flex: 1;
    background: var(--shade7);
  }
  .bar::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 100%;
    height: calc(var(--h) * 100%);
    background: var(--shade3);
  }
</style>
