interface ProductContentProps {
  content: string;
}

export function ProductContent({ content }: ProductContentProps) {
  if (!content) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-semibold">Descrição Detalhada</h3>
      <div className="prose prose-sm max-w-none rounded-md border border-border bg-card p-6">
        <p className="text-sm leading-relaxed text-card-foreground">
          {content}
        </p>
      </div>
    </div>
  );
}
