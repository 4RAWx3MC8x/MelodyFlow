
const createIcon = (iconName: string) => (props: { className?: string }) => (
    <span className={`material-symbols-rounded ${props.className}`}>
      {iconName}
    </span>
);

export const MusicNote = createIcon("music_note");
