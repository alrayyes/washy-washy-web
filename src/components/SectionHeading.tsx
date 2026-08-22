/** An uppercase section label — Sheet.tsx's read-only card and ConfigViewer.tsx's editable one share it (#60). */
export default function SectionHeading({ children }: { children: string }) {
  return (
    <p className="mb-1 text-xs font-bold tracking-wide text-muted">{children.toUpperCase()}</p>
  );
}
