<script lang="ts">
	import Fa from "svelte-fa";
	import {
		faGear,
		faTimes,
		faRotateLeft,
		faCopy,
		faFloppyDisk,
		faFolderOpen,
		faFileExport,
		faFileImport,
		faTrash,
	} from "@fortawesome/free-solid-svg-icons";
	import {
		theme,
		defaultTheme,
		themeLabels,
		themeGroups,
		applyTheme,
		savedThemes,
		builtInThemes,
		saveTheme,
		deleteTheme,
		loadTheme,
		exportThemes,
		importThemes,
		type ThemeColors,
	} from "./theme";

	const loadBuiltIn = (name: string) => {
		const colors = builtInThemes[name];
		if (colors) {
			theme.value = { ...colors };
			applyTheme(theme.value);
		}
	};

	let open = false;
	let copyFeedback = false;
	let saveFeedback = false;
	let importFeedback = "";
	let fileInput: HTMLInputElement;

	$: themeNames = Object.keys(savedThemes.value);

	const updateColor = (key: keyof ThemeColors, value: string) => {
		theme.value = { ...theme.value, [key]: value };
		applyTheme(theme.value);
	};

	const resetTheme = () => {
		theme.value = { ...defaultTheme };
		applyTheme(theme.value);
	};

	const copyTheme = async () => {
		const json = JSON.stringify(theme.value, null, "\t");
		await navigator.clipboard.writeText(json);
		copyFeedback = true;
		setTimeout(() => (copyFeedback = false), 1500);
	};

	const handleSave = () => {
		const name = prompt("Enter a name for this theme:");
		if (!name) return;
		saveTheme(name.trim(), theme.value);
		saveFeedback = true;
		setTimeout(() => (saveFeedback = false), 1500);
	};

	const handleLoad = (name: string) => {
		loadTheme(name);
	};

	const handleDelete = (name: string) => {
		deleteTheme(name);
		themeNames = Object.keys(savedThemes.value);
	};

	const handleExport = () => {
		const json = exportThemes();
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "themes.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = () => {
		fileInput.click();
	};

	const onFileSelected = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			const text = await file.text();
			const count = importThemes(text);
			themeNames = Object.keys(savedThemes.value);
			importFeedback = `Imported ${count} theme${count !== 1 ? "s" : ""}`;
			setTimeout(() => (importFeedback = ""), 2000);
		} catch {
			importFeedback = "Invalid JSON file";
			setTimeout(() => (importFeedback = ""), 2000);
		}
		input.value = "";
	};
</script>

<button class="gear-btn" on:click={() => (open = true)} title="Settings">
	<Fa icon={faGear} />
</button>

<input
	type="file"
	accept=".json"
	style="display:none"
	bind:this={fileInput}
	on:change={onFileSelected}
/>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div class="backdrop" on:click={() => (open = false)}>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h3>Theme Settings</h3>
				<div class="header-actions">
					<button class="action-btn" on:click={copyTheme} title="Copy current theme as JSON">
						<Fa icon={faCopy} size="sm" />
						{copyFeedback ? "Copied!" : "Copy"}
					</button>
					<button class="action-btn" on:click={resetTheme} title="Reset to defaults">
						<Fa icon={faRotateLeft} size="sm" />
						Reset
					</button>
					<button class="close-btn" on:click={() => (open = false)}>
						<Fa icon={faTimes} />
					</button>
				</div>
			</div>

			<div class="modal-body">
				<!-- Built-in themes -->
				<div class="group">
					<h4 class="group-label">Presets</h4>
					<div class="preset-list">
						{#each Object.entries(builtInThemes) as [name, colors]}
							<button class="preset-btn" on:click={() => loadBuiltIn(name)} title="Load {name}">
								<span class="preset-swatches">
									<span class="preset-swatch" style="background:{colors.appBg}"></span>
									<span class="preset-swatch" style="background:{colors.panelBg}"></span>
									<span class="preset-swatch" style="background:{colors.accent}"></span>
									<span class="preset-swatch" style="background:{colors.textPrimary}"></span>
								</span>
								<span class="preset-name">{name}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Save / Load section -->
				<div class="group">
					<h4 class="group-label">Saved Themes</h4>
					<div class="save-row">
						<button class="action-btn save-btn" on:click={handleSave} title="Save current theme">
							<Fa icon={faFloppyDisk} size="sm" />
							{saveFeedback ? "Saved!" : "Save Current"}
						</button>
						<button class="action-btn" on:click={handleExport} title="Export all saved themes">
							<Fa icon={faFileExport} size="sm" />
							Export
						</button>
						<button class="action-btn" on:click={handleImport} title="Import themes from JSON">
							<Fa icon={faFileImport} size="sm" />
							Import
						</button>
					</div>
					{#if importFeedback}
						<div class="import-feedback">{importFeedback}</div>
					{/if}
					{#if themeNames.length === 0}
						<p class="empty-hint">No saved themes yet. Click "Save Current" to save one.</p>
					{:else}
						<div class="saved-list">
							{#each themeNames as name}
								<div class="saved-item">
									<button
										class="saved-name"
										on:click={() => handleLoad(name)}
										title="Load this theme"
									>
										<Fa icon={faFolderOpen} size="xs" />
										{name}
									</button>
									<button
										class="delete-btn"
										on:click={() => handleDelete(name)}
										title="Delete this theme"
									>
										<Fa icon={faTrash} size="xs" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Color pickers -->
				{#each themeGroups as group}
					<div class="group">
						<h4 class="group-label">{group.label}</h4>
						{#each group.keys as key}
							<label class="color-row">
								<span class="color-label">{themeLabels[key]}</span>
								<span class="color-value">{theme.value[key]}</span>
								<input
									type="color"
									value={theme.value[key]}
									on:input={(e) => updateColor(key, e.currentTarget.value)}
									class="color-input"
								/>
							</label>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.gear-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--theme-border);
		border-radius: 6px;
		background: var(--theme-secondary-btn);
		color: var(--theme-text-secondary);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}
	.gear-btn:hover {
		background: var(--theme-secondary-btn-hover);
		color: var(--theme-text-primary);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal {
		background: var(--theme-panel-bg);
		border: 1px solid var(--theme-border);
		border-radius: 8px;
		width: 420px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--theme-border);
	}
	.modal-header h3 {
		margin: 0;
		font-size: 0.95rem;
		color: var(--theme-text-primary);
	}
	.header-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--theme-border);
		border-radius: 4px;
		background: var(--theme-secondary-btn);
		color: var(--theme-text-secondary);
		font-size: 0.7rem;
		cursor: pointer;
	}
	.action-btn:hover {
		background: var(--theme-secondary-btn-hover);
		color: var(--theme-text-primary);
	}
	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--theme-text-secondary);
		cursor: pointer;
	}
	.close-btn:hover {
		background: var(--theme-secondary-btn-hover);
		color: var(--theme-text-primary);
	}

	.modal-body {
		overflow-y: auto;
		padding: 0.75rem 1rem;
	}
	.group {
		margin-bottom: 0.75rem;
	}
	.group-label {
		margin: 0 0 0.35rem 0;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--theme-text-secondary);
	}

	/* Presets */
	.preset-list {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.preset-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.65rem;
		border: 1px solid var(--theme-border);
		border-radius: 6px;
		background: var(--theme-secondary-btn);
		color: var(--theme-text-primary);
		font-size: 0.8rem;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.preset-btn:hover {
		background: var(--theme-secondary-btn-hover);
		border-color: var(--theme-accent);
	}
	.preset-swatches {
		display: flex;
		gap: 2px;
	}
	.preset-swatch {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		border: 1px solid rgba(128, 128, 128, 0.3);
	}
	.preset-name {
		font-weight: 600;
	}

	/* Save/Load */
	.save-row {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}
	.save-btn {
		flex: 1;
	}
	.import-feedback {
		font-size: 0.7rem;
		color: var(--theme-accent);
		margin-bottom: 0.4rem;
	}
	.empty-hint {
		margin: 0;
		font-size: 0.7rem;
		color: var(--theme-text-secondary);
		font-style: italic;
	}
	.saved-list {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.saved-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: 4px;
	}
	.saved-item:hover {
		background: var(--theme-panel-bg-light);
	}
	.saved-name {
		flex: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.5rem;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--theme-text-primary);
		font-size: 0.8rem;
		cursor: pointer;
		text-align: left;
	}
	.saved-name:hover {
		color: var(--theme-accent);
	}
	.delete-btn {
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
	.delete-btn:hover {
		background: var(--theme-error);
		color: var(--theme-primary-btn-text);
	}

	/* Color pickers */
	.color-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.4rem;
		border-radius: 4px;
		cursor: pointer;
	}
	.color-row:hover {
		background: var(--theme-panel-bg-light);
	}
	.color-label {
		flex: 1;
		font-size: 0.8rem;
		color: var(--theme-text-primary);
	}
	.color-value {
		font-size: 0.7rem;
		font-family: monospace;
		color: var(--theme-text-secondary);
	}
	.color-input {
		width: 28px;
		height: 28px;
		padding: 0;
		border: 2px solid var(--theme-border-light);
		border-radius: 4px;
		background: none;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
	}
	.color-input::-webkit-color-swatch-wrapper {
		padding: 0;
	}
	.color-input::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}
</style>
