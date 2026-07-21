interface RestartBannerProps {
  emphasize: boolean;
  onDismiss: () => void;
}

export function RestartBanner({ emphasize, onDismiss }: RestartBannerProps) {
  return (
    <div className={`restart-banner${emphasize ? " restart-banner-flash" : ""}`}>
      <span className="restart-banner-flag" aria-hidden="true" />
      <p>
        Thunderbird solo lee <code>user.js</code> al iniciar. Cerralo y
        volvé a abrirlo para que las etiquetas se actualicen.
      </p>
      <button className="restart-banner-dismiss" onClick={onDismiss} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  );
}
