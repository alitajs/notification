import { ExtendApplication } from '@/extend/application';
import { Application } from 'egg';
import { createHook, Hook } from './utils';

export interface AppHookExtension {
  onAppReady: Hook<[Application]>;
}

export const extendAppHook: ExtendApplication<AppHookExtension> = () => {
  return {
    onAppReady: createHook<[Application]>(),
  };
};

extendAppHook.cacheKey = Symbol('ExtendAppHook');

export default extendAppHook;
