<script>
  import { asPercent, prDiffColor, wrDiffColor } from '../helpers.js';

  export let data;

  let selectedRole = 'ALL';

  const roles = [
    { key: 'ALL', name: 'All' },
    { key: 'TOP', name: 'Top' },
    { key: 'JUNGLE', name: 'Jungle' },
    { key: 'MID', name: 'Mid' },
    { key: 'ADC', name: 'ADC' },
    { key: 'SUPPORT', name: 'Support' },
  ];
</script>

<nav class="filter">
  {#each roles as role}
    <button
      on:click={() => (selectedRole = role.key)}
      class:active={role.key === selectedRole}>{role.name}</button
    >
  {/each}
</nav>

<div class="lists">
  {#each data as list}
    {#if list.entries.filter(c => selectedRole === 'ALL' || c.role === selectedRole)?.length}
      <div>
        <h4 class="type-subtitle1 title">{list.title}</h4>
        <ol class="entries" data-list-type={list.type}>
          {#each list.entries.filter(c => selectedRole === 'ALL' || c.role === selectedRole) as champion, index}
            <li class="entry">
              <h4 class="index">#{index + 1}</h4>
              <div class="img">
                <img src={champion.image} alt="" height="40" width="40" />
              </div>
              <div class="info">
                <p class="type-overline role">
                  {champion.role}
                </p>
                <p class="type-h6 name">
                  {champion.name}
                </p>
                {#if champion.playrateDiff}
                  <div
                    class="stats"
                    data-wr-gain={champion.winrateDiff > 0 && 'true'}
                    data-pr-gain={champion.playrateDiff > 0 && 'true'}
                  >
                    <div
                      class="playrate"
                      style={`--diff: ${prDiffColor(champion.playrateDiff)}`}
                    >
                      <span class="type-overline"> Play-Rate % </span>
                      <p class="type-h6">
                        {asPercent(champion.latest.playrate)}
                        <span class="type-caption--bold super">
                          {asPercent(champion.playrateDiff)}
                        </span>
                      </p>
                    </div>
                    <div
                      class="winrate"
                      style={`--diff: ${wrDiffColor(champion.winrateDiff)}`}
                    >
                      <span class="type-overline"> Win-rate </span>
                      <p class="type-h6">
                        {asPercent(champion.latest.winrate)}
                        <span class="type-caption--bold super">
                          {asPercent(champion.winrateDiff)}
                        </span>
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            </li>
          {/each}
        </ol>
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  .filter {
    margin-bottom: var(--sp-6);

    button {
      position: relative;
      background: transparent;
      border: none;
      color: var(--shade2);
      height: var(--sp-11);
      min-width: 7ch;
      padding: 0 var(--sp-3);
      cursor: pointer;

      &:hover {
        color: var(--shade0);
        background: hsla(var(--shade5-hsl) / 0.15);
      }
      &.active {
        color: var(--shade0);
        background: hsla(var(--shade5-hsl) / 0.25);

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 20%;
          width: var(--sp-6);
          height: 2px;
          background: var(--primary);
          transform: translateX(-50%);
        }
      }
    }
  }

  .title {
    margin-bottom: 0.5rem;
  }

  .lists {
    --gap: var(--sp-2);

    display: flex;
    flex-direction: column;
    gap: calc(var(--gap) * 6);

    > * {
      flex: 1;
    }
  }

  .entries {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--gap);

    @media screen and (max-width: 1000px) {
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
  }

  .entry {
    position: relative;
    display: flex;
    align-items: flex-start;
    padding: var(--sp-5);
    padding-right: var(--sp-10);
    background: var(--shade8);
    transform: translate3d(0, 0, 0) scale(1);
    overflow: hidden;
    transition: background var(--transition), box-shadow var(--transition);

    &:hover {
      background: hsla(var(--shade6-hsl) / 0.5);
      box-shadow: 0 0 20px 5px var(--shade10);
    }

    .index {
      position: absolute;
      top: -0.65ch;
      right: 0.15ch;
      font-size: 3.5rem;
      opacity: 0.15;
      color: var(--shade3);
    }

    .img {
      position: relative;
      margin-right: var(--sp-4);
      width: 40px;
      aspect-ratio: 1;
      overflow: hidden;

      img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1.15);
      }
    }

    .info {
      flex: 1;
    }
    .role {
      color: var(--shade1);
      margin-bottom: var(--sp-1);
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-top: var(--sp-5);
    }
    .type-overline {
      display: block;
      margin-bottom: var(--sp-1);
      color: var(--shade2);
    }
    .super {
      vertical-align: super;
      color: var(--diff);
    }
    .super::before {
      content: '';
      margin-left: 0.5ch;
    }
    [data-wr-gain='true'] .winrate .super::before {
      content: '+';
    }
    [data-pr-gain='true'] .playrate .super::before {
      content: '+';
    }
  }

  [data-list-type='both'] {
    .index {
      color: var(--yellow);
      opacity: 0.1;
    }
    .name {
      color: var(--yellow);
    }
    .entry {
      background: hsla(var(--yellow-hsl) / 0.1);
      border: 1px solid hsla(var(--yellow-hsl) / 0.15);

      &:hover {
        background: hsla(var(--yellow-hsl) / 0.13);
      }
    }
  }

  [data-list-type='playrate'] .stats .winrate {
    --diff: var(--shade3) !important;
  }
  [data-list-type='winrate'] .stats .playrate {
    --diff: var(--shade3) !important;
  }
</style>
