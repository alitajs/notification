import { EggPlugin } from 'egg';
import 'tsconfig-paths/register';

const plugin: EggPlugin = {
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
};

export default plugin;
