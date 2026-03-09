<script lang="ts">
  import Fa from "svelte-fa";
  import {
    faFolderOpen,
    faCircleExclamation,
    faTriangleExclamation,
    faCheckCircle,
    faCircleInfo,
    faChevronLeft,
    faChevronRight,
    faArrowUpRightFromSquare,
  } from "@fortawesome/free-solid-svg-icons";

  interface DirectoryEntry {
    key: string;
    label: string;
    description: string;
    links: { label: string; url: string }[];
    value: string;
    required: boolean;
    onSelect: () => void;
  }

  import { localStorageData } from "./localStorageData";

  export let directories: DirectoryEntry[] = [];

  const expandedState = localStorageData("configDrawerExpanded", true);
  let expanded = expandedState.value;
  $: expandedState.value = expanded;
  let openTooltip: string | null = null;

  const toggleTooltip = (key: string) => {
    openTooltip = openTooltip === key ? null : key;
  };

  $: hasError = directories.some((d) => d.required && !d.value);
  $: hasWarning =
    !hasError && directories.some((d) => !d.required && !d.value);
</script>

<svelte:window on:click={() => (openTooltip = null)} />

<div class="drawer" class:collapsed={!expanded}>
  {#if expanded}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="drawer-header" on:click={() => (expanded = false)}>
      <span class="drawer-title">
        {#if hasError}
          <Fa icon={faCircleExclamation} color="var(--theme-error)" />
        {:else if hasWarning}
          <Fa icon={faTriangleExclamation} color="var(--theme-warning)" />
        {:else}
          <Fa icon={faCheckCircle} color="var(--theme-success)" />
        {/if}
        Asset Configuration
      </span>
      <span class="icon-btn">
        <Fa icon={faChevronLeft} />
      </span>
    </div>

    <div class="drawer-content">
      {#each directories as dir}
        <div class="entry" class:error={dir.required && !dir.value}>
          <div class="entry-header">
            <span class="entry-label">{dir.label}</span>

            <span class="entry-actions">
              {#if dir.links.length}
                <button
                  class="icon-btn info-btn"
                  on:click|stopPropagation={() => toggleTooltip(dir.key)}
                  title={dir.description}
                >
                  <Fa icon={faCircleInfo} color="var(--theme-accent)" size="sm" />
                </button>
              {/if}

              {#if !dir.value}
                {#if dir.required}
                  <span title="Required"><Fa icon={faCircleExclamation} color="var(--theme-error)" size="sm" /></span>
                {:else}
                  <span title="Optional — not configured"><Fa icon={faTriangleExclamation} color="var(--theme-warning)" size="sm" /></span>
                {/if}
              {:else}
                <span title="Configured"><Fa icon={faCheckCircle} color="var(--theme-success)" size="sm" /></span>
              {/if}

              <button
                class="icon-btn pick-btn"
                on:click={dir.onSelect}
                title="Select folder"
              >
                <Fa icon={faFolderOpen} size="sm" />
              </button>
            </span>
          </div>

          {#if openTooltip === dir.key}
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div class="info-popup" on:click|stopPropagation>
              <p class="info-desc">{dir.description}</p>
              {#each dir.links as link}
                <a
                  class="info-link"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Fa icon={faArrowUpRightFromSquare} size="xs" />
                  {link.label}
                </a>
              {/each}
            </div>
          {/if}

          <div class="entry-value">
            {dir.value || "Not configured"}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <button class="expand-area" on:click={() => (expanded = true)}>
      <div class="expand-top">
        <Fa icon={faChevronRight} size="sm" />
      </div>
      <div class="collapsed-label">
        {#if hasError}
          <Fa icon={faCircleExclamation} color="var(--theme-error)" size="sm" />
        {:else if hasWarning}
          <Fa icon={faTriangleExclamation} color="var(--theme-warning)" size="sm" />
        {:else}
          <Fa icon={faCheckCircle} color="var(--theme-success)" size="sm" />
        {/if}
        <span class="collapsed-text">Asset Configuration</span>
      </div>
    </button>
  {/if}
</div>

<style>
  .drawer {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background: var(--theme-app-bg);
    border-right: 1px solid var(--theme-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    transition: width 0.2s ease;
  }
  .drawer:not(.collapsed) {
    width: 280px;
  }
  .drawer.collapsed {
    width: 36px;
  }

  /* Header */
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border-bottom: 1px solid var(--theme-border);
    cursor: pointer;
  }
  .drawer-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--theme-text-primary);
    white-space: nowrap;
  }

  /* Collapsed state */
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
    transform: rotate(180deg);
    white-space: nowrap;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* Entries */
  .drawer-content {
    flex: 1;
    overflow-y: auto;
  }
  .entry {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid var(--theme-panel-bg);
    position: relative;
  }
  .entry-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
  }
  .entry-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--theme-text-primary);
    flex: 1;
    white-space: nowrap;
  }
  .entry-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
  }
  .entry-value {
    font-size: 0.7rem;
    color: var(--theme-text-secondary);
    margin-top: 0.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Buttons */
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
  .pick-btn {
    color: var(--theme-text-primary);
  }

  /* Info popup */
  .info-popup {
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    top: 100%;
    z-index: 100;
    padding: 0.6rem;
    background: var(--theme-panel-bg);
    border: 1px solid var(--theme-border-light);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  .info-desc {
    margin: 0 0 0.5rem 0;
    font-size: 0.75rem;
    color: var(--theme-text-secondary);
    line-height: 1.4;
  }
  .info-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: var(--theme-accent);
    text-decoration: none;
    padding: 0.2rem 0;
  }
  .info-link:hover {
    text-decoration: underline;
    filter: brightness(1.3);
  }
</style>
