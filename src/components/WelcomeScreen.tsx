import logo from "../assets/logo.png";

interface WelcomeScreenProps {
  onPick: () => void;
  picking: boolean;
  error: string | null;
}

export function WelcomeScreen({ onPick, picking, error }: WelcomeScreenProps) {
  return (
    <>
      <div className="glow glow-a" aria-hidden="true" />
      <div className="glow glow-b" aria-hidden="true" />
      <div className="welcome-card">
        <img src={logo} className="logo-mark" alt="" />
        <h1 className="welcome-title">Thunderlabel</h1>
        <p className="welcome-copy">
          Gestioná las etiquetas de Thunderbird guardadas en{" "}
          <code>user.js</code> — el archivo que ya sincronizás entre tus
          equipos con clientes IMAP.
        </p>
        {error && <p className="welcome-error">{error}</p>}
        <button className="btn btn-accent" onClick={onPick} disabled={picking}>
          {picking ? "Abriendo selector…" : "Elegir carpeta del perfil…"}
        </button>
        <p className="welcome-hint">
          Es la carpeta que contiene <code>user.js</code>, por ejemplo{" "}
          <code>%APPDATA%\Thunderbird\Profiles\xxxxxxxx.default-release</code>.
        </p>
      </div>
    </>
  );
}
