import { NativeSelect } from '@chakra-ui/react';
import { Form, useLocation, useSubmit } from 'react-router';

import { LANGUAGES, useLanguage, useT } from '../i18n';

/** The interface's language (#344), remembered in a cookie. */
const LanguageSwitcher = () => {
  const language = useLanguage();
  const t = useT();
  const { pathname, search } = useLocation();
  const submit = useSubmit();
  return (
    <Form method="post" action="/language">
      <input type="hidden" name="back" value={`${pathname}${search}`} />
      <NativeSelect.Root size="xs" width="auto">
        <NativeSelect.Field
          name="language"
          aria-label={t('footer.language')}
          value={language}
          onChange={(event) => submit(event.currentTarget.form)}
        >
          {LANGUAGES.map(([code, name]) => (
            <option key={code} value={code} lang={code}>
              {name}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Form>
  );
};

export default LanguageSwitcher;
