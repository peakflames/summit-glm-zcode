// Boot sequence. The startup stamp (TOR-01-WqWceSw) must be the FIRST console
// record the app emits, so log.info comes before any other statement.
import './styles.css';
import { log } from './lib/logger';
import { APP_NAME, APP_VERSION } from './lib/version';
import { renderApp } from './app';

log.info(`${APP_NAME} v${APP_VERSION} starting`);

renderApp();
