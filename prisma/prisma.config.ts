import { existsSync } from 'node:fs';

export default {
  ...(existsSync('.env') ? { env: '.env' } : {}),
};
