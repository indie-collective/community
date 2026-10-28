import { Box, Grid, Progress, Stack, Text } from '@chakra-ui/react';
import {
  LuBinoculars,
  LuBookOpen,
  LuCalendarDays,
  LuCamera,
  LuFeather,
  LuFileCheck,
  LuFlag,
  LuHourglass,
  LuLibrary,
  LuLock,
  LuMapPin,
  LuRocket,
  LuSearch,
  LuSprout,
} from 'react-icons/lu';

// Each achievement's emblem (#377), by its key in utils/missions.
const ICONS = {
  'first-find': LuSearch,
  'first-mission': LuFlag,
  'missions-50': LuRocket,
  'records-10': LuFileCheck,
  'records-100': LuBookOpen,
  'records-1000': LuLibrary,
  archivist: LuFeather,
  cartographer: LuMapPin,
  photographer: LuCamera,
  'talent-scout': LuBinoculars,
  historian: LuHourglass,
  'event-planner': LuCalendarDays,
  founder: LuSprout,
};

// A medal per tier: its face (light to dark) and its rim. The same in light
// and dark mode, as medals are.
const TIERS = {
  bronze: { face: ['#f6c79b', '#b8692f'], rim: '#8a4a1c', label: 'Bronze' },
  silver: { face: ['#f4f6f8', '#9aa4b0'], rim: '#69737f', label: 'Silver' },
  gold: { face: ['#ffe58a', '#d39c12'], rim: '#9b7000', label: 'Gold' },
  platinum: { face: ['#e3fbf6', '#5fc9b8'], rim: '#2f8f81', label: 'Platinum' },
};

const SIZES = { md: { box: '64px', icon: '26px' }, lg: { box: '88px', icon: '36px' } };

/**
 * An achievement as a medal (#377): its emblem on its tier's face. Locked
 * ones are greyed out, with a lock; `celebrate` pops it in, for one just
 * earned (reduced motion: no animation, theme.js).
 */
export const Medal = ({ achievement, locked = false, size = 'md', celebrate = false, delay = 0 }) => {
  const tier = TIERS[achievement.tier] ?? TIERS.bronze;
  const Icon = ICONS[achievement.key] ?? LuSearch;
  const { box, icon } = SIZES[size];
  return (
    <Box
      position="relative"
      boxSize={box}
      flexShrink={0}
      borderRadius="full"
      borderWidth="3px"
      borderColor={tier.rim}
      bgImage={`radial-gradient(circle at 30% 25%, rgba(255,255,255,0.75), transparent 45%), linear-gradient(145deg, ${tier.face[0]}, ${tier.face[1]})`}
      boxShadow={`inset 0 -4px 0 rgba(0,0,0,0.12), inset 0 0 0 3px rgba(255,255,255,0.35), 0 3px 8px rgba(0,0,0,0.18)`}
      display="grid"
      placeItems="center"
      color="white"
      filter={locked ? 'grayscale(1)' : undefined}
      opacity={locked ? 0.45 : 1}
      transition="transform 200ms ease-out"
      _hover={locked ? undefined : { transform: 'rotate(-6deg) scale(1.06)' }}
      animation={celebrate ? 'badge-pop 650ms cubic-bezier(0.2, 0, 0, 1) both' : undefined}
      animationDelay={celebrate ? `${delay}ms` : undefined}
      aria-hidden
    >
      <Icon size={icon} style={{ filter: `drop-shadow(0 1px 1px ${tier.rim})` }} />
      {locked && (
        <Box
          position="absolute"
          right="-2px"
          bottom="-2px"
          boxSize="22px"
          borderRadius="full"
          bg="surface"
          color="muted"
          display="grid"
          placeItems="center"
          shadow="sm"
        >
          <LuLock size="12px" />
        </Box>
      )}
    </Box>
  );
};

/**
 * Achievements as a shelf of medals with their names (#377): earned ones,
 * and with `progress` (from achievementProgress) the locked ones too, each
 * with how far there is to go.
 */
const AchievementShelf = ({ achievements, size = 'md', celebrate = false, ...rest }) => (
  <Grid
    as="ul"
    listStyleType="none"
    templateColumns={`repeat(auto-fill, minmax(${size === 'lg' ? '132px' : '112px'}, 1fr))`}
    gap={4}
    {...rest}
  >
    {achievements.map((achievement, index) => {
      const locked = achievement.earned === false;
      return (
        <Stack as="li" key={achievement.key} align="center" textAlign="center" gap={1.5}>
          <Medal
            achievement={achievement}
            locked={locked}
            size={size}
            celebrate={celebrate}
            delay={index * 120}
          />
          <Text fontWeight="semibold" fontSize="sm" lineHeight="1.3" color={locked ? 'muted' : undefined}>
            {achievement.name}
          </Text>
          <Text fontSize="xs" color="muted" lineHeight="1.3">
            {achievement.description}
          </Text>
          <Text srOnly>
            {TIERS[achievement.tier]?.label} badge{locked ? ', not earned yet' : ''}
          </Text>
          {locked && achievement.target > 1 && (
            <Box w="80%">
              <Progress.Root
                size="xs"
                value={achievement.value}
                max={achievement.target}
                colorPalette="green"
                aria-label={`${achievement.name}: ${achievement.value} of ${achievement.target}`}
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="2xs" color="muted" mt={0.5} fontVariantNumeric="tabular-nums">
                {achievement.value.toLocaleString('en')} of {achievement.target.toLocaleString('en')}
              </Text>
            </Box>
          )}
        </Stack>
      );
    })}
  </Grid>
);

export default AchievementShelf;
