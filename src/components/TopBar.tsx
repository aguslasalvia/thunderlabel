import logo from "../assets/logo.png";

interface TopBarProps {
  path: string;
  dirty: boolean;
  saving: boolean;
  onChangeFolder: () => void;
  onReload: () => void;
  onSave: () => void;
}

export function TopBar({
  path,
  dirty,
  saving,
  onChangeFolder,
  onReload,
  onSave,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-brand brand">
        <img src={logo} className="logo-mark" alt="" />
        Thunder<span className="brand-accent">label</span>
      </div>
      <div className="topbar-path" title={path}>
        {path}
        {dirty && <span className="dirty-dot" aria-label="Cambios sin guardar" />}
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost" onClick={onChangeFolder}>
          Cambiar carpeta
        </button>
        <button className="btn btn-ghost" onClick={onReload}>
          Recargar
        </button>
        <button
          className="btn btn-accent"
          onClick={onSave}
          disabled={!dirty || saving}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </header>
  );
}
