import { Application } from 'egg';

export default class Boot {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  async serverDidReady() {
    this.app.hook.onAppReady.run(this.app);
  }
}
