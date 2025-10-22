import { Barcode, Ruler, Weight } from "lucide-react";

interface ProductSpecificationsProps {
  width: number | null;
  height: number | null;
  depth: number | null;
  weight: number | null;
  barcode: string | null;
}

export function ProductSpecifications({
  width,
  height,
  depth,
  weight,
  barcode,
}: ProductSpecificationsProps) {
  const specs = [
    {
      icon: Ruler,
      label: "Dimensões",
      value:
        width && height && depth ? `${width} × ${height} × ${depth} cm` : null,
    },
    {
      icon: Weight,
      label: "Peso",
      value: weight ? `${weight} kg` : null,
    },
    {
      icon: Barcode,
      label: "Código de Barras",
      value: barcode,
    },
  ].filter((spec) => spec.value);

  if (specs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Especificações</h3>
      <div className="grid grid-cols-1 gap-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
          >
            <spec.icon className="size-4 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                {spec.label}
              </span>
              <span className="text-sm font-medium">{spec.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
