interface Attribute {
  id: string;
  name: string;
  value: string;
}

interface ProductAttributesProps {
  attributes: Attribute[];
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  if (attributes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Características</h3>
      <div className="grid grid-cols-1 gap-2">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="flex items-center justify-between rounded-md bg-secondary px-4 py-2.5"
          >
            <span className="text-sm text-muted-foreground">{attr.name}</span>
            <span className="text-sm font-medium">{attr.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
