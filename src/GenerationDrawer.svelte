<script lang="ts">
  import Fa from "svelte-fa";
  import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
  import { localStorageData } from "./localStorageData";

  const expandedState = localStorageData("generationDrawerExpanded", true);
  export let expanded = expandedState.value;
  $: expandedState.value = expanded;
</script>

<div class="drawer" class:collapsed={!expanded}>
  {#if expanded}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="drawer-header" on:click={() => (expanded = false)}>
      <span class="icon-btn">
        <Fa icon={faChevronRight} />
      </span>
      <span class="drawer-title">Generation</span>
    </div>
    <div class="drawer-content">
      <slot />
    </div>
  {:else}
    <button class="expand-area" on:click={() => (expanded = true)}>
      <div class="expand-top">
        <Fa icon={faChevronLeft} size="sm" />
      </div>
      <div class="collapsed-label">
        <span class="collapsed-text">Generation</span>
      </div>
    </button>
  {/if}
</div>

<style>
  .drawer {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: var(--theme-app-bg);
    border-left: 1px solid var(--theme-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    transition: width 0.2s ease;
  }
  .drawer:not(.collapsed) {
    width: 300px;
  }
  .drawer.collapsed {
    width: 36px;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--theme-border);
    cursor: pointer;
  }
  .drawer-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--theme-text-primary);
    white-space: nowrap;
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
  }

  .expand-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--theme-text-secondary);
  }
  .expand-area:hover {
    background: var(--theme-panel-bg);
  }
  .expand-top {
    padding: 0.75rem 0;
    display: flex;
    justify-content: center;
  }
  .collapsed-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }
  .collapsed-text {
    writing-mode: vertical-rl;
    white-space: nowrap;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--theme-text-secondary);
    cursor: pointer;
    flex-shrink: 0;
  }
  .icon-btn:hover {
    background: var(--theme-border);
    color: var(--theme-text-primary);
  }
</style>
