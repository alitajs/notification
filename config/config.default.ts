import { ParserConfig } from '@/middleware/parser';
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { ClientOpts as RedisOpts } from 'redis';

export default (appInfo: EggAppInfo): PowerPartial<EggAppConfig> & typeof bizConfig => {
  const config = {} as PowerPartial<EggAppConfig>;

  /**
   * System configuration
   */
  // Key of cookies
  config.keys = `${appInfo.name}_WE_DO_NOT_USE_COOKIE`;

  // Nginx proxy
  config.proxy = true;

  /**
   * Middlewares and their configuration
   */
  // Enabled global middlewares
  config.middleware = ['chore', 'errorcode', 'parser'];

  // `bodyParser` will parse body to object automatically
  config.bodyParser = {
    enableTypes: ['text'],
    // enable: false,
  };

  // 404 not found
  config.notfound = {
    pageUrl: '/exception/404',
  };

  // Security
  config.security = {
    csrf: { enable: false },
    domainWhiteList: ['.mofoncloud.com', '.mofon.cloud', 'imhele.com'],
  };

  // Redis
  config.redis = {
    prefix: 'appname:',
  } as RedisOpts;

  config.parser = {} as ParserConfig;

  /**
   * Other configuration for controller or service
   */
  const bizConfig = {};

  return {
    ...config,
    ...bizConfig,
  };
};
