import Jello from './app/Jello';

// App class for all js
export default class App {
  constructor() {
    this.app = this;
    this.jello;
    this.timeline;
    this.initialize();
  }

  initialize() {
    // new instance of Jello class
    this.jello = new Jello();
    
  }
}

// App export to scripts/app.js
const app = new App();
