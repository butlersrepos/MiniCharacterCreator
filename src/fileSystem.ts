export interface FileEntry {
	name: string;
	path: string;
	children?: FileEntry[];
}

// Global map of relative path -> FileSystemFileHandle
const fileHandles = new Map<string, FileSystemFileHandle>();

export async function pickDirectory(mode: FileSystemPermissionMode = "read"): Promise<FileSystemDirectoryHandle | null> {
	try {
		return await window.showDirectoryPicker({ mode });
	} catch {
		return null;
	}
}

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

	return entries;
}

export async function readFileByPath(path: string): Promise<ArrayBuffer> {
	const handle = fileHandles.get(path);
	if (!handle) {
		throw new Error(`File not found: ${path}`);
	}
	const file = await handle.getFile();
	return file.arrayBuffer();
}

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

// IndexedDB for persisting directory handles across sessions
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
