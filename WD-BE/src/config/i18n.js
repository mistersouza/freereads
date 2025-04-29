import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const filepath = fileURLToPath(import.meta.url);
const dirPath = path.dirname(filepath);

const defaultLanguage = 'en';
const supportedLanguages = [defaultLanguage, 'de'];
i18n.configure({
  locales: supportedLanguages,
  directory: path.resolve(dirPath, '../locales'),
  defaultLocale: defaultLanguage,
  autoReload: true,
  updateFiles: false,
  objectNotation: false,
  directoryPermissions: '755',
  register: global,
  defaultLocaleOnly: false,
  syncFiles: false,
});

export { supportedLanguages, defaultLanguage };
