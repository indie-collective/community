import { Button, Menu, Portal } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaBluesky, FaFacebook, FaLinkedin, FaMastodon, FaXTwitter } from 'react-icons/fa6';
import { LuLink, LuShare2 } from 'react-icons/lu';
import { useRouteLoaderData } from 'react-router';

import { toaster } from './ui/toaster';
import { shareLinks } from '../utils/share';
import { useT } from '../i18n';

const MASTODON_INSTANCE = 'mastodon-instance';

const icons = {
  bluesky: FaBluesky,
  mastodon: FaMastodon,
  linkedin: FaLinkedin,
  facebook: FaFacebook,
  x: FaXTwitter,
};

/** The Mastodon server to share to: asked once, then remembered. */
function mastodonInstance() {
  let saved = null;
  try {
    saved = localStorage.getItem(MASTODON_INSTANCE);
  } catch {
    // Storage blocked: ask every time.
  }
  const instance = window
    .prompt('Your Mastodon server (e.g. mastodon.social)', saved ?? '')
    ?.trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  if (!instance) return null;
  try {
    localStorage.setItem(MASTODON_INSTANCE, instance);
  } catch {
    // Not remembered, that's all.
  }
  return instance;
}

/**
 * Share a game, event or organisation page (#327): the system share sheet
 * where there is one, Bluesky, Mastodon, LinkedIn, Facebook and X as plain
 * links (no third-party scripts), and Copy link.
 */
const ShareMenu = ({ title, path }) => {
  const root = useRouteLoaderData('root');
  const t = useT();
  const [canShare, setCanShare] = useState(false);
  // Only known in the browser, after hydration.
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);

  const url = new URL(path, root?.origin ?? 'https://community.indieco.xyz').href;
  const text = `${title} on Indie Collective`;
  const links = shareLinks({ url, text });

  const open = (href) => window.open(href, '_blank', 'noopener,noreferrer');

  const onSelect = async ({ value }) => {
    if (value === 'native') {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Closed without sharing.
      }
    } else if (value === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        toaster.create({ title: t('share.copied'), type: 'success' });
      } catch {
        toaster.create({ title: "Couldn't copy the link", description: url, type: 'error' });
      }
    } else if (value === 'mastodon') {
      const instance = mastodonInstance();
      if (instance) open(links.mastodon(instance));
    } else {
      open(links[value]);
    }
  };

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }} onSelect={onSelect}>
      <Menu.Trigger asChild>
        <Button size="sm" variant="outline">
          <LuShare2 />
          {t('share.share')}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {canShare && (
              <>
                <Menu.Item value="native">
                  <LuShare2 />
                  {t('share.via')}
                </Menu.Item>
                <Menu.Separator />
              </>
            )}
            {[
              ['bluesky', 'Bluesky'],
              ['mastodon', 'Mastodon'],
              ['linkedin', 'LinkedIn'],
              ['facebook', 'Facebook'],
              ['x', 'X'],
            ].map(([value, label]) => {
              const Icon = icons[value];
              return (
                <Menu.Item key={value} value={value}>
                  <Icon />
                  {label}
                </Menu.Item>
              );
            })}
            <Menu.Separator />
            <Menu.Item value="copy">
              <LuLink />
              {t('share.copy')}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default ShareMenu;
