import { Application } from 'egg';

export default class Boot {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  async serverDidReady() {
    await this.app.hook.onAppReady.wait(this.app);
  }
}
