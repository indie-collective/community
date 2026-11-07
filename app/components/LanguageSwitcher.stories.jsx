import LanguageSwitcher from './LanguageSwitcher';

export default {
  title: 'Layout/LanguageSwitcher',
  component: LanguageSwitcher,
};

export const Default = {};

// Breton shows while its flag is on (#373).
export const WithBreton = { parameters: { router: { root: { features: { breton: true } } } } };
