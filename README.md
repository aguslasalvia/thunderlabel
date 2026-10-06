# Thunderlabel

Thunderlabel es una app de escritorio para gestionar las **etiquetas de mensajes de Mozilla Thunderbird** (esas etiquetas de color como "Importante", "Pendiente", etc.) sin tener que editar el archivo de configuración a mano.

## El problema que resuelve

Thunderbird guarda el nombre y el color de cada etiqueta dentro del archivo `user.js` del perfil (por ejemplo `Thunderbird/Profiles/xxxxxxxx.default-release/user.js`). Si usás Thunderbird en varias máquinas con la misma cuenta IMAP y sincronizás ese archivo entre equipos, mantener las etiquetas iguales en todos lados significa editar ese archivo de texto a mano, con el riesgo de romper el formato o pisar otras preferencias que ya tenga guardadas.

Thunderlabel te da una interfaz simple para ver, crear, editar y borrar esas etiquetas, y guarda los cambios directo en el `user.js`, preservando intacto el resto del archivo (todas las líneas que no son etiquetas quedan como estaban).

## Qué hace exactamente

- **Elegís la carpeta del perfil de Thunderbird** la primera vez (la que contiene `user.js`); la app recuerda esa carpeta para la próxima vez que la abrís.
- **Lista las etiquetas existentes** con su nombre y color, leídas directamente del `user.js`.
- **Agregar, renombrar, recolorear o borrar** etiquetas desde la UI, con confirmación antes de borrar o de descartar cambios sin guardar.
- **Guarda los cambios** reescribiendo solo las líneas de etiquetas (`user_pref("mailnews.tags...")`) del `user.js`, sin tocar el resto de las preferencias.
- **Evita que Thunderbird pise tus cambios**: si Thunderbird está abierto al momento de guardar, la app bloquea el guardado y te avisa, porque Thunderbird reescribe `user.js` con sus propios datos en memoria al cerrarse.
- **Te avisa que hay que reiniciar Thunderbird**: como Thunderbird solo lee `user.js` al arrancar, la app muestra un aviso para recordarte cerrarlo y volver a abrirlo después de guardar.

## Plataformas soportadas

- Windows (`.exe` / `.msi`)
- Linux: Ubuntu, Linux Mint y Debian (`.deb` / `.AppImage`)

Los instaladores se publican automáticamente como [Releases](../../releases) de este repositorio cada vez que se crea un tag `vX.Y.Z` — la versión del instalador se toma directamente del tag.

## Stack técnico

- [Tauri 2](https://tauri.app/) + Rust para el backend y el empaquetado de escritorio
- React + TypeScript (Vite) para la interfaz
- [bun](https://bun.sh/) como gestor de paquetes

## Desarrollo

```bash
bun install
bun run tauri dev
```

## Build local

```bash
bun run tauri build
```

Esto genera los instaladores para la plataforma donde se ejecuta, en `src-tauri/target/release/bundle/`.

## Recomendado para el IDE

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
