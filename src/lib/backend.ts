import { invoke } from "@tauri-apps/api/core";
import { open, confirm, message } from "@tauri-apps/plugin-dialog";
import { load, type Store } from "@tauri-apps/plugin-store";
import type { LoadedTags, Tag } from "../types";

const LAST_PATH_KEY = "lastProfilePath";

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load("thunderlabel.json", { autoSave: true });
  }
  return storePromise;
}

export async function getLastProfilePath(): Promise<string | null> {
  const store = await getStore();
  return (await store.get<string>(LAST_PATH_KEY)) ?? null;
}

export async function setLastProfilePath(path: string): Promise<void> {
  const store = await getStore();
  await store.set(LAST_PATH_KEY, path);
}

export async function pickProfileFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Elegí la carpeta del perfil de Thunderbird",
  });
  if (Array.isArray(selected)) return selected[0] ?? null;
  return selected ?? null;
}

export function userJsPath(folder: string): string {
  const separator = folder.includes("\\") ? "\\" : "/";
  return folder.endsWith(separator) ? `${folder}user.js` : `${folder}${separator}user.js`;
}

export async function loadTags(path: string): Promise<LoadedTags> {
  return invoke<LoadedTags>("load_tags", { path });
}

export async function saveTags(
  path: string,
  tags: Tag[],
  otherLines: string[],
  deletedKeys: string[],
): Promise<void> {
  await invoke("save_tags", { path, tags, otherLines, deletedKeys });
}

export async function confirmDelete(tagName: string): Promise<boolean> {
  return confirm(`¿Borrar la etiqueta "${tagName}"?`, {
    title: "Confirmar borrado",
    kind: "warning",
  });
}

export async function confirmDiscard(): Promise<boolean> {
  return confirm("Hay cambios sin guardar. ¿Descartarlos y recargar?", {
    title: "Cambios sin guardar",
    kind: "warning",
  });
}

export async function showError(text: string): Promise<void> {
  await message(text, { title: "Thunderlabel", kind: "error" });
}
