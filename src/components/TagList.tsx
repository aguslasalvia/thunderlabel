import type { Tag } from "../types";
import { TagRow } from "./TagRow";

interface TagListProps {
  tags: Tag[];
  onChange: (key: string, patch: Partial<Pick<Tag, "name" | "color">>) => void;
  onDelete: (tag: Tag) => void;
}

export function TagList({ tags, onChange, onDelete }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="tag-list-empty">
        Todavía no hay etiquetas acá. Agregá la primera abajo.
      </div>
    );
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <TagRow key={tag.key} tag={tag} onChange={onChange} onDelete={onDelete} />
      ))}
    </div>
  );
}
