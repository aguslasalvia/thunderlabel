import { useState } from "react";

interface AddTagFormProps {
  defaultColor: string;
  onAdd: (name: string, color: string) => void;
}

export function AddTagForm({ defaultColor, onAdd }: AddTagFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    setName("");
    setColor(defaultColor);
  }

  return (
    <form className="add-tag-form" onSubmit={submit}>
      <input
        type="color"
        className="tag-color-input"
        value={color}
        onChange={(e) => setColor(e.currentTarget.value)}
        aria-label="Color de la nueva etiqueta"
      />
      <input
        type="text"
        className="add-tag-input"
        placeholder="Nombre de la nueva etiqueta"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <button type="submit" className="btn btn-ghost-accent" disabled={!name.trim()}>
        + Agregar etiqueta
      </button>
    </form>
  );
}
