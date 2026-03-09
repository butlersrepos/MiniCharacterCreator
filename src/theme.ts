import { localStorageData } from "./localStorageData";

export const defaultTheme = {
	appBg: "#1a1b1e",
	panelBg: "#25262b",
	panelBgLight: "#2c2e33",
	border: "#373a40",
	borderLight: "#495057",
	textPrimary: "#c1c2c5",
	textSecondary: "#909296",
	primaryBtn: "#1971c2",
	primaryBtnHover: "#1864ab",
	primaryBtnText: "#ffffff",
	secondaryBtn: "#383a40",
	secondaryBtnHover: "#4a4d52",
	secondaryBtnText: "#c1c2c5",
	accent: "#339af0",
	selected: "#495057",
	success: "#40c057",
	warning: "#f59f00",
	error: "#e03131",
};

export type ThemeColors = typeof defaultTheme;

export const themeLabels: Record<keyof ThemeColors, string> = {
	appBg: "App Background",
	panelBg: "Panel Background",
	panelBgLight: "Panel Highlight",
	border: "Border",
	borderLight: "Border Light",
	textPrimary: "Text",
	textSecondary: "Text Muted",
	primaryBtn: "Primary Button",
	primaryBtnHover: "Primary Button Hover",
	primaryBtnText: "Primary Button Text",
	secondaryBtn: "Secondary Button",
	secondaryBtnHover: "Secondary Button Hover",
	secondaryBtnText: "Secondary Button Text",
	accent: "Accent / Links",
	selected: "Selected Item",
	success: "Success",
	warning: "Warning",
	error: "Error",
};

export const themeGroups: { label: string; keys: (keyof ThemeColors)[] }[] = [
	{
		label: "Backgrounds",
		keys: ["appBg", "panelBg", "panelBgLight"],
	},
	{
		label: "Text",
		keys: ["textPrimary", "textSecondary"],
	},
	{
		label: "Borders",
		keys: ["border", "borderLight"],
	},
	{
		label: "Buttons",
		keys: [
			"primaryBtn",
			"primaryBtnHover",
			"primaryBtnText",
			"secondaryBtn",
			"secondaryBtnHover",
			"secondaryBtnText",
		],
	},
	{
		label: "Accent & Status",
		keys: ["accent", "selected", "success", "warning", "error"],
	},
];

export const builtInThemes: Record<string, ThemeColors> = {
	"Dark": { ...defaultTheme },
	"Light": {
		appBg: "#f0f0f0",
		panelBg: "#ffffff",
		panelBgLight: "#f5f5f5",
		border: "#d4d4d4",
		borderLight: "#bfbfbf",
		textPrimary: "#1a1a1a",
		textSecondary: "#6b6b6b",
		primaryBtn: "#1971c2",
		primaryBtnHover: "#1864ab",
		primaryBtnText: "#ffffff",
		secondaryBtn: "#e0e0e0",
		secondaryBtnHover: "#d0d0d0",
		secondaryBtnText: "#1a1a1a",
		accent: "#1971c2",
		selected: "#d0e2f2",
		success: "#2b8a3e",
		warning: "#e67700",
		error: "#c92a2a",
	},
	"Game Boy": {
		appBg: "#0f380f",
		panelBg: "#306230",
		panelBgLight: "#8bac0f",
		border: "#0f380f",
		borderLight: "#306230",
		textPrimary: "#9bbc0f",
		textSecondary: "#8bac0f",
		primaryBtn: "#8bac0f",
		primaryBtnHover: "#9bbc0f",
		primaryBtnText: "#0f380f",
		secondaryBtn: "#306230",
		secondaryBtnHover: "#0f380f",
		secondaryBtnText: "#9bbc0f",
		accent: "#9bbc0f",
		selected: "#0f380f",
		success: "#9bbc0f",
		warning: "#8bac0f",
		error: "#306230",
	},
	"Pip-Boy": {
		appBg: "#0a0a0a",
		panelBg: "#0f1a10",
		panelBgLight: "#162416",
		border: "#1a3a1a",
		borderLight: "#245a24",
		textPrimary: "#14fe83",
		textSecondary: "#0eb85e",
		primaryBtn: "#14fe83",
		primaryBtnHover: "#17ff90",
		primaryBtnText: "#0a0a0a",
		secondaryBtn: "#0f1a10",
		secondaryBtnHover: "#1a3a1a",
		secondaryBtnText: "#14fe83",
		accent: "#14fe83",
		selected: "#1a3a1a",
		success: "#14fe83",
		warning: "#b8e600",
		error: "#fe4a14",
	},
	"Virtual Boy": {
		appBg: "#000000",
		panelBg: "#1a0000",
		panelBgLight: "#330000",
		border: "#4d0000",
		borderLight: "#660000",
		textPrimary: "#ff0000",
		textSecondary: "#aa0000",
		primaryBtn: "#cc0000",
		primaryBtnHover: "#ff0000",
		primaryBtnText: "#000000",
		secondaryBtn: "#1a0000",
		secondaryBtnHover: "#330000",
		secondaryBtnText: "#ff0000",
		accent: "#ff0000",
		selected: "#4d0000",
		success: "#ff0000",
		warning: "#cc0000",
		error: "#ff3333",
	},
	"C64": {
		appBg: "#40318d",
		panelBg: "#3b2d82",
		panelBgLight: "#4a3a9a",
		border: "#6c5eb5",
		borderLight: "#7c6fc5",
		textPrimary: "#a59dff",
		textSecondary: "#7b72d5",
		primaryBtn: "#6c5eb5",
		primaryBtnHover: "#7c6fc5",
		primaryBtnText: "#ffffff",
		secondaryBtn: "#4a3a9a",
		secondaryBtnHover: "#5a4aaa",
		secondaryBtnText: "#a59dff",
		accent: "#a59dff",
		selected: "#5a4aaa",
		success: "#6ec56e",
		warning: "#c5c56e",
		error: "#c56e6e",
	},
	"SNES RPG": {
		appBg: "#000033",
		panelBg: "#0a0a5c",
		panelBgLight: "#14148a",
		border: "#2828a8",
		borderLight: "#3c3cc0",
		textPrimary: "#ffffff",
		textSecondary: "#9090d0",
		primaryBtn: "#e8a030",
		primaryBtnHover: "#f0b848",
		primaryBtnText: "#000033",
		secondaryBtn: "#0a0a5c",
		secondaryBtnHover: "#14148a",
		secondaryBtnText: "#ffffff",
		accent: "#e8a030",
		selected: "#14148a",
		success: "#50e850",
		warning: "#e8a030",
		error: "#e83030",
	},
	"NES": {
		appBg: "#bcbcbc",
		panelBg: "#d4d4d4",
		panelBgLight: "#e8e8e8",
		border: "#9c9c9c",
		borderLight: "#8c8c8c",
		textPrimary: "#000000",
		textSecondary: "#4c4c4c",
		primaryBtn: "#cc0000",
		primaryBtnHover: "#e01010",
		primaryBtnText: "#ffffff",
		secondaryBtn: "#c0c0c0",
		secondaryBtnHover: "#a8a8a8",
		secondaryBtnText: "#000000",
		accent: "#cc0000",
		selected: "#a8a8a8",
		success: "#00a800",
		warning: "#f8a000",
		error: "#cc0000",
	},
};

export const theme = localStorageData<ThemeColors>("theme", {
	...defaultTheme,
});

export const savedThemes = localStorageData<Record<string, ThemeColors>>(
	"savedThemes",
	{},
);

export function applyTheme(colors: ThemeColors) {
	const root = document.documentElement;
	for (const [key, value] of Object.entries(colors)) {
		const cssVar =
			"--theme-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
		root.style.setProperty(cssVar, value);
	}
}

export function saveTheme(name: string, colors: ThemeColors) {
	savedThemes.value = { ...savedThemes.value, [name]: { ...colors } };
}

export function deleteTheme(name: string) {
	const copy = { ...savedThemes.value };
	delete copy[name];
	savedThemes.value = copy;
}

export function loadTheme(name: string) {
	const colors = savedThemes.value[name];
	if (colors) {
		theme.value = { ...colors };
		applyTheme(theme.value);
	}
}

export function exportThemes(): string {
	return JSON.stringify(savedThemes.value, null, "\t");
}

export function importThemes(json: string): number {
	const parsed = JSON.parse(json);
	let count = 0;
	for (const [name, colors] of Object.entries(parsed)) {
		if (colors && typeof colors === "object") {
			savedThemes.value = {
				...savedThemes.value,
				[name]: colors as ThemeColors,
			};
			count++;
		}
	}
	return count;
}
