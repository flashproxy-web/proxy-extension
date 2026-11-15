const FLAG_FILES = import.meta.glob<string>('/node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const FLAG_FILE = /([a-z-]+)\.svg$/;

const FLAGS = new Map(
  Object.entries(FLAG_FILES).flatMap(([path, url]): [string, string][] => {
    const code = FLAG_FILE.exec(path)?.[1];
    return code ? [[code, url]] : [];
  })
);

export const flagUrl = (cc: string): string | undefined => FLAGS.get(cc.toLowerCase());
