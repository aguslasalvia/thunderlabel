import type { Tag } from "../types";

interface TagRowProps {
  tag: Tag;
  onChange: (key: string, patch: Partial<Pick<Tag, "name" | "color">>) => void;
  onDelete: (tag: Tag) => void;
}

export function TagRow({ tag, onChange, onDelete }: TagRowProps) {
  return (
    <div className="tag-row">
      <input
        type="color"
        className="tag-color-input"
        value={tag.color}
        onChange={(e) => onChange(tag.key, { color: e.currentTarget.value })}
        aria-label={`Color de ${tag.name}`}
      />
      <input
        type="text"
        className="tag-name-input"
        value={tag.name}
        onChange={(e) => onChange(tag.key, { name: e.currentTarget.value })}
        aria-label="Nombre de la etiqueta"
      />
      <span className="tag-key">{tag.key}</span>
      <button
        className="tag-delete"
        onClick={() => onDelete(tag)}
        aria-label={`Borrar ${tag.name}`}
        title="Borrar etiqueta"
      >
        ×
      </button>
    </div>
  );
}
