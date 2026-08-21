import { useEffect, useState } from "react";
import {
  confirmDelete,
  confirmDiscard,
  getLastProfilePath,
  loadTags,
  pickProfileFolder,
  saveTags,
  setLastProfilePath,
  showError,
  userJsPath,
} from "./lib/backend";
import { nextColor } from "./lib/colors";
import { slugify } from "./lib/slug";
import { AddTagForm } from "./components/AddTagForm";
import { RestartBanner } from "./components/RestartBanner";
import { TagList } from "./components/TagList";
import { TopBar } from "./components/TopBar";
import { WelcomeScreen } from "./components/WelcomeScreen";
import type { Tag } from "./types";
import "./App.css";

function App() {
  const [folder, setFolder] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [otherLines, setOtherLines] = useState<string[]>([]);
  const [deletedKeys, setDeletedKeys] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [welcomeError, setWelcomeError] = useState<string | null>(null);
  const [showRestartBanner, setShowRestartBanner] = useState(false);
  const [flashRestart, setFlashRestart] = useState(false);

  useEffect(() => {
    (async () => {
      const last = await getLastProfilePath();
      if (last) {
        await openFolder(last, { silent: true });
      }
    })();
  }, []);

  async function openFolder(nextFolder: string, opts?: { silent?: boolean }) {
    try {
      const loaded = await loadTags(userJsPath(nextFolder));
      setFolder(nextFolder);
      setTags(loaded.tags);
      setOtherLines(loaded.otherLines);
      setDeletedKeys([]);
      setDirty(false);
      setWelcomeError(null);
      setShowRestartBanner(true);
      await setLastProfilePath(nextFolder);
    } catch (err) {
      if (!opts?.silent) {
        setWelcomeError(`No se pudo leer esa carpeta: ${String(err)}`);
      }
    }
  }

  async function handlePick() {
    setPicking(true);
    try {
      const picked = await pickProfileFolder();
      if (picked) await openFolder(picked);
    } finally {
      setPicking(false);
    }
  }

  async function handleReload() {
    if (!folder) return;
    if (dirty) {
      const ok = await confirmDiscard();
      if (!ok) return;
    }
    await openFolder(folder);
  }

  function handleTagChange(
    key: string,
    patch: Partial<Pick<Tag, "name" | "color">>,
  ) {
    setTags((prev) =>
      prev.map((t) => (t.key === key ? { ...t, ...patch } : t)),
    );
    setDirty(true);
  }

  async function handleTagDelete(tag: Tag) {
    const ok = await confirmDelete(tag.name || tag.key);
    if (!ok) return;
    setTags((prev) => prev.filter((t) => t.key !== tag.key));
    setDeletedKeys((prev) => (prev.includes(tag.key) ? prev : [...prev, tag.key]));
    setDirty(true);
  }

  function handleTagAdd(name: string, color: string) {
    const key = slugify(name, tags.map((t) => t.key));
    setTags((prev) => [...prev, { key, name, color }]);
    setDirty(true);
  }

  async function handleSave() {
    if (!folder) return;
    setSaving(true);
    try {
      const keysToRemove = deletedKeys.filter(
        (key) => !tags.some((t) => t.key === key),
      );
      await saveTags(userJsPath(folder), tags, otherLines, keysToRemove);
      setDeletedKeys([]);
      setDirty(false);
      setShowRestartBanner(true);
      setFlashRestart(true);
      setTimeout(() => setFlashRestart(false), 2000);
    } catch (err) {
      await showError(`No se pudo guardar: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  if (!folder) {
    return (
      <main className="app app-welcome">
        <WelcomeScreen onPick={handlePick} picking={picking} error={welcomeError} />
      </main>
    );
  }

  return (
    <main className="app">
      <TopBar
        path={userJsPath(folder)}
        dirty={dirty}
        saving={saving}
        onChangeFolder={handlePick}
        onReload={handleReload}
        onSave={handleSave}
      />
      {showRestartBanner && (
        <RestartBanner
          emphasize={flashRestart}
          onDismiss={() => setShowRestartBanner(false)}
        />
      )}
      <section className="content">
        <AddTagForm
          defaultColor={nextColor(tags.map((t) => t.color))}
          onAdd={handleTagAdd}
        />
        <TagList tags={tags} onChange={handleTagChange} onDelete={handleTagDelete} />
      </section>
    </main>
  );
}

export default App;
