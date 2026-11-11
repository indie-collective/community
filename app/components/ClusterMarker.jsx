const width = 32;
const height = 32;

const styleFromCount = (count) => {
  return {
    width,
    height,
    borderRadius: '50%',
    borderWidth: 2,
    borderColor: 'var(--chakra-colors-ink)',
    borderStyle: 'solid',
    background: 'var(--chakra-colors-surface)',
    color: 'var(--chakra-colors-ink)',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'default',
    fontFamily: 'var(--chakra-fonts-heading)',
    fontSize: count >= 1000 ? '11px' : '14px',
    fontWeight: 600,
  };
};

export default function ClusterMarker({ left, top, count }) {
  return (
    <div
      style={Object.assign(styleFromCount(count), {
        transform: `translate(${left - width / 2}px, ${top - height / 2}px)`,
      })}
    >
      {count}
    </div>
  );
}
