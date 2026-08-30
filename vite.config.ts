import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_HOST = 'kralbet2302.com';

/** Домен, отдающий загруженные логотипы (`<host>/bet/media/...`). */
const DEFAULT_LOGO_HOST = 'kralbet2302.com';

/** В dev логотипы идут через прокси: напрямую их режет Cross-Origin-Resource-Policy. */
const LOGO_PREFIX = '/logos';

export default defineConfig(({ mode }) => {
  // Зеркало меняется — правки в коде не нужны: SOCKET_HOST в .env или в окружении.
  const env = loadEnv(mode, process.cwd(), '');
  const host = env.SOCKET_HOST || DEFAULT_HOST;
  const logoHost = env.LOGO_HOST || DEFAULT_LOGO_HOST;

  const target = `https://srv.${host}`;
  const origin = `https://www.${host}`;

  return {
    plugins: [react()],
    define: {
      __SOCKET_TARGET__: JSON.stringify(target),
      __SPORTSBOOK_URL__: JSON.stringify(LOGO_PREFIX),
    },
    server: {
      port: 5173,
      proxy: {
        '/sport': {
          target,
          changeOrigin: true,
          // Часть зеркал отдаёт просроченный сертификат (так было у srv.kralbet2298.com),
          // а браузер отключить проверку не даёт — поэтому снимаем её на прокси.
          secure: false,
          ws: true,
          headers: {
            Origin: origin,
            Referer: `${origin}/`,
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          },
        },
        // Логотипы отдаются с Cross-Origin-Resource-Policy — кросс-доменная
        // вставка блокируется браузером, поэтому в dev ходим через свой origin.
        [LOGO_PREFIX]: {
          target: `https://${logoHost}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(new RegExp(`^${LOGO_PREFIX}`), '/bet'),
          headers: {
            Referer: `https://${logoHost}/`,
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          },
        },
      },
    },
  };
});
