import { Application } from 'egg';

export default async (app: Application) => {
  const { router } = app;
  router.get('/');
};
