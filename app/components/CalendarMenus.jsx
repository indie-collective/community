import { Button, Menu, Portal } from '@chakra-ui/react';
import { FaApple, FaGoogle, FaMicrosoft } from 'react-icons/fa6';
import { LuCalendarPlus, LuDownload, LuLink, LuRss } from 'react-icons/lu';
import { useRouteLoaderData } from 'react-router';

import { toaster } from './ui/toaster';
import { googleCalendarUrl, outlookCalendarUrl } from '../utils/ical';
import { useT } from '../i18n';

// The site's origin, for absolute calendar and feed addresses.
const useOrigin = () => useRouteLoaderData('root')?.origin ?? 'https://community.indieco.xyz';

const copy = async (text, title) => {
  try {
    await navigator.clipboard.writeText(text);
    toaster.create({ title, type: 'success' });
  } catch {
    toaster.create({ title: "Couldn't copy it", description: text, type: 'error' });
  }
};

/** "Add to calendar" for one event (#342): an .ics file, Google or Outlook. */
export const AddToCalendar = ({ event, path, place }) => {
  const origin = useOrigin();
  const t = useT();
  const details = {
    name: event.name,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    about: event.about,
    place,
    url: `${origin}${path}`,
  };
  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <Button size="sm" variant="outline">
          <LuCalendarPlus />
          {t('calendar.add')}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="ics" asChild>
              <a href={`${path}/calendar.ics`} download>
                <LuDownload />
                Apple, Outlook… (.ics)
              </a>
            </Menu.Item>
            <Menu.Item value="google" asChild>
              <a href={googleCalendarUrl(details)} target="_blank" rel="noopener noreferrer">
                <FaGoogle />
                Google Calendar
              </a>
            </Menu.Item>
            <Menu.Item value="outlook" asChild>
              <a href={outlookCalendarUrl(details)} target="_blank" rel="noopener noreferrer">
                <FaMicrosoft />
                Outlook.com
              </a>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

/**
 * Subscribe to a list's events and news (#342): its calendar in a calendar
 * app (kept up to date), or its Atom feed.
 */
export const SubscribeMenu = ({ calendarPath, feedPath, label }) => {
  const origin = useOrigin();
  const t = useT();
  const calendar = calendarPath && `${origin}${calendarPath}`;
  const webcal = calendar?.replace(/^https?:/, 'webcal:');
  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <Button size="sm" variant="outline">
          <LuCalendarPlus />
          {label ?? t('calendar.subscribe')}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {calendar && (
              <>
                <Menu.Item value="apple" asChild>
                  <a href={webcal}>
                    <FaApple />
                    {t('calendar.app')}
                  </a>
                </Menu.Item>
                <Menu.Item value="google" asChild>
                  <a
                    href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGoogle />
                    Google Calendar
                  </a>
                </Menu.Item>
                <Menu.Item value="copy" onSelect={() => copy(calendar, 'Calendar address copied')}>
                  <LuLink />
                  {t('calendar.copy')}
                </Menu.Item>
              </>
            )}
            {calendar && feedPath && <Menu.Separator />}
            {feedPath && (
              <Menu.Item value="feed" asChild>
                <a href={feedPath} type="application/atom+xml">
                  <LuRss />
                  {t('calendar.feed')}
                </a>
              </Menu.Item>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
