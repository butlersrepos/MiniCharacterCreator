import { writable } from "svelte/store";
import JSZip from "jszip";

export interface FileEntry {
	name: string;
	path: string;
	children?: FileEntry[];
}

// Feature detection
export const hasNativeFS = typeof window.showDirectoryPicker === "function";

// Global map of relative path -> file data
const fileHandles = new Map<string, FileSystemFileHandle>();
const fallbackFiles = new Map<string, File>();

// Reactive signal that bumps whenever directories finish loading
export const filesReady = writable(0);

// ── Directory Picking ───────────────────────────────────────────

export async function pickDirectory(
	mode: FileSystemPermissionMode = "read",
): Promise<FileSystemDirectoryHandle | null> {
	if (!hasNativeFS) return null;
	try {
		return await window.showDirectoryPicker({ mode });
	} catch {
		return null;
	}
}

/**
 * Fallback: use <input webkitdirectory> to pick a folder.
 * Returns the folder name and populates the fallbackFiles map.
 */
export function pickDirectoryFallback(): Promise<{ name: string; files: File[] } | null> {
	return new Promise((resolve) => {
		const input = document.createElement("input");
		input.type = "file";
		input.setAttribute("webkitdirectory", "");
		input.addEventListener("change", () => {
			const files = Array.from(input.files ?? []);
			if (!files.length) {
				resolve(null);
				return;
			}
			// Extract the root folder name from webkitRelativePath
			const rootName = files[0].webkitRelativePath.split("/")[0];
			resolve({ name: rootName, files });
		});
		// Detect cancel (input gets no change event)
		input.addEventListener("cancel", () => resolve(null));
		input.click();
	});
}

/**
 * Build a FileEntry tree from a flat list of File objects (from webkitdirectory input).
 * Also populates the fallbackFiles map for reading later.
 */
export function buildTreeFromFiles(files: File[], rootName: string): FileEntry[] {
	// Strip the root folder prefix from all paths so our tree starts inside it
	const strippedFiles = files.map((f) => ({
		file: f,
		// webkitRelativePath is "RootFolder/sub/file.png" — strip "RootFolder/"
		relativePath: f.webkitRelativePath.split("/").slice(1).join("/"),
	}));

	// Populate fallback map
	for (const { file, relativePath } of strippedFiles) {
		fallbackFiles.set(relativePath, file);
	}

	// Build tree structure
	const root = new Map<string, any>();

	for (const { relativePath } of strippedFiles) {
		const parts = relativePath.split("/");
		let current = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!current.has(part)) {
				current.set(part, i === parts.length - 1 ? null : new Map());
			}
			const next = current.get(part);
			if (next instanceof Map) {
				current = next;
			}
		}
	}

	function mapToEntries(map: Map<string, any>, basePath: string): FileEntry[] {
		const entries: FileEntry[] = [];
		for (const [name, value] of map) {
			const entryPath = basePath ? `${basePath}/${name}` : name;
			if (value instanceof Map) {
				const children = mapToEntries(value, entryPath);
				entries.push({ name, path: entryPath, children });
			} else {
				entries.push({ name, path: entryPath });
			}
		}
		entries.sort((a, b) => {
			if (a.children && !b.children) return -1;
			if (!a.children && b.children) return 1;
			return (a.name || "").localeCompare(b.name || "");
		});
		return entries;
	}

	const tree = mapToEntries(root, "");
	filesReady.update((n) => n + 1);
	return tree;
}

// ── Directory Reading (native FS only) ──────────────────────────

export async function readDirectory(
	handle: FileSystemDirectoryHandle,
	basePath: string = "",
): Promise<FileEntry[]> {
	const entries: FileEntry[] = [];

	for await (const [name, entryHandle] of handle.entries()) {
		const entryPath = basePath ? `${basePath}/${name}` : name;

		if (entryHandle.kind === "file") {
			fileHandles.set(entryPath, entryHandle as FileSystemFileHandle);
			entries.push({ name, path: entryPath });
		} else if (entryHandle.kind === "directory") {
			const children = await readDirectory(entryHandle as FileSystemDirectoryHandle, entryPath);
			entries.push({ name, path: entryPath, children });
		}
	}

	entries.sort((a, b) => {
		if (a.children && !b.children) return -1;
		if (!a.children && b.children) return 1;
		return (a.name || "").localeCompare(b.name || "");
	});

	// Only signal at the top-level call (not recursive children)
	if (!basePath) {
		filesReady.update((n) => n + 1);
	}

	return entries;
}

// ── File Reading ────────────────────────────────────────────────

export async function readFileByPath(path: string): Promise<ArrayBuffer> {
	// Try native handle first
	const handle = fileHandles.get(path);
	if (handle) {
		const file = await handle.getFile();
		return file.arrayBuffer();
	}
	// Try fallback File object
	const file = fallbackFiles.get(path);
	if (file) {
		return file.arrayBuffer();
	}
	throw new Error(`File not found: ${path}`);
}

// ── File Saving ─────────────────────────────────────────────────

export async function saveFile(
	dirHandle: FileSystemDirectoryHandle,
	name: string,
	data: Blob,
): Promise<void> {
	const fileHandle = await dirHandle.getFileHandle(name, { create: true });
	const writable = await fileHandle.createWritable();
	await writable.write(data);
	await writable.close();
}

/**
 * Fallback: collect blobs into a zip and trigger a download.
 */
export async function saveAsZip(
	files: { name: string; data: Blob }[],
	zipName: string = "sprites.zip",
): Promise<void> {
	const zip = new JSZip();
	for (const f of files) {
		zip.file(f.name, f.data);
	}
	const blob = await zip.generateAsync({ type: "blob" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = zipName;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── IndexedDB for persisting directory handles across sessions ──

const DB_NAME = "MiniCharacterCreator";
const STORE_NAME = "directoryHandles";

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			request.result.createObjectStore(STORE_NAME);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function storeHandle(
	key: string,
	handle: FileSystemDirectoryHandle,
): Promise<void> {
	const db = await openDB();
	const tx = db.transaction(STORE_NAME, "readwrite");
	tx.objectStore(STORE_NAME).put(handle, key);
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function getStoredHandle(
	key: string,
): Promise<FileSystemDirectoryHandle | null> {
	try {
		const db = await openDB();
		const tx = db.transaction(STORE_NAME, "readonly");
		const request = tx.objectStore(STORE_NAME).get(key);
		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	} catch {
		return null;
	}
}

export async function tryRestoreHandle(
	key: string,
	mode: FileSystemPermissionMode = "read",
): Promise<FileSystemDirectoryHandle | null> {
	if (!hasNativeFS) return null;
	const handle = await getStoredHandle(key);
	if (!handle) return null;

	const perm = await handle.queryPermission({ mode });
	if (perm === "granted") return handle;

	// requestPermission needs a user gesture, so try it
	// (this will work if called from a click handler)
	try {
		const requested = await handle.requestPermission({ mode });
		if (requested === "granted") return handle;
	} catch {
		// Not in a user gesture context, ignore
	}

	return null;
}
