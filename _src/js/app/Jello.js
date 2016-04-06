export default class Jello {

  // Cached variables that can be used and changed in all the functions in the class
  constructor(options = {}) {
    this.defaults = {};
    this.options = options;
    this.canvasHolder = document.getElementById('jello-container');
    this.imgWidth = 1920;
    this.imgHeight = 960;
    this.imgRatio = this.imgHeight / this.imgWidth;
    this.winWidth = window.innerWidth;
    this.bgArray = [];
    this.bgSpriteArray = [];
    this.renderer = PIXI.autoDetectRenderer( this.winWidth, (this.winWidth * this.imgRatio) );
    this.stage = new PIXI.Container();
    this.imgContainer = new PIXI.Container();
    this.imageCounter = 0;
    this.displacementSprite = PIXI.Sprite.fromImage('/assets/images/distortion/dmap-clouds-01.jpg');
    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    this.currentMap = {};
    this.mapCounter = 0;
    this.mapArray = [];
    this.raf = this.animateFilters.bind(this);

    this.isDistorted = true;
    this.isTransitioning = false;

    this.initialize();
  }

  initialize() {
    console.log('Jello initialized')

    this.defaults = {
      transition: 1,
      speed: 0.5,
      dispScale: 200,
      dispX: true,
      dispY: true,
      count: 0
    };

    this.update();

    // An array of images for background (.jpg)
    // They'll transition in the order listed below
    this.bgArray.push(
      'image-1',
      'image-2'
    );

    // An array of displacement maps
    // They'll transition in the order below with the included settings
    this.mapArray.push(
      {
        image: 'dmap-clouds-01.jpg',
        speed: 0.5,
        scale: 200
      },
      {
        image: 'dmap-glass-01.jpg',
        speed: 0.3,
        scale: 200
      }
    );

    this.backgroundFill();
    this.buildStage();
    this.createBackgrounds();
    this.createFilters();
    this.animateFilters();
    this.eventListener();

    this.renderer.view.setAttribute('class', 'jello-canvas');
    this.canvasHolder.appendChild(this.renderer.view);
  }

  // define animations and call this.raf
  animateFilters() {
    this.displacementFilter.scale.x = this.settings.dispX ? this.settings.transition * this.settings.dispScale : 0;
    this.displacementFilter.scale.y = this.settings.dispY ? this.settings.transition * (this.settings.dispScale + 10) : 0;

    this.displacementSprite.x = Math.sin(this.settings.count * 0.15) * 200;
    this.displacementSprite.y = Math.cos(this.settings.count * 0.13) * 200;

    this.displacementSprite.rotation = this.settings.count * 0.06;

    this.settings.count += 0.05 * this.settings.speed;

    this.renderer.render(this.stage);

    window.requestAnimationFrame(this.raf);
  }

  // canvas built to fill width of window
  backgroundFill() {
    this.renderer.view.setAttribute('style', 'height:auto;width:100%;');
  }

  // main container for animation
  buildStage() {
    this.imgContainer.position.x = this.imgWidth / 2;
    this.imgContainer.position.y = this.imgHeight / 2;

    this.stage.scale.x = this.stage.scale.y = this.winWidth / this.imgWidth;
    this.stage.interactive = true;
    this.stage.addChild(this.imgContainer);
  }

  // cycle through this.bgArray and change images with crossfade
  changeImage() {
    if(this.imageCounter < (this.bgArray.length - 1)) {
      this.imageCounter++;
    } else {
      this.imageCounter = 0;
    }

    this.bgSpriteArray.map((sprite, i) => {
      if(i == this.imageCounter) {
        TweenLite.to(sprite, 1, {alpha: 1, ease:Power2.easeInOut});
      } else {
        TweenLite.to(sprite, 1, {alpha: 0, ease:Power2.easeInOut});
      }
    });
  }

  // cycle through this.mapArray and change displacement maps
  changeMap() {
    if(this.mapCounter < (this.mapArray.length - 1)) {
      this.mapCounter++;
    } else {
      this.mapCounter = 0;
    }

    this.currentMap = this.mapArray[this.mapCounter];
    console.log(this.currentMap)
    this.displacementSprite = PIXI.Sprite.fromImage(`/assets/images/distortion/${this.currentMap.image}`);
    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    this.createFilters();
  }

  // preload all backgrounds for quick transitions
  createBackgrounds() {
    this.bgArray.map((image) => {
      const bg = PIXI.Sprite.fromImage(`/assets/images/bg/${image}.jpg`);

      // Set image anchor to the center of the image
      bg.anchor.x = 0.5;
      bg.anchor.y = 0.5;      

      this.imgContainer.addChild(bg);
      this.bgSpriteArray.push(bg);

      // set first image alpha to 1, all else to 0
      bg.alpha = this.bgSpriteArray.length === 1 ? 1 : 0;
    });
  }

  // distortion filters added to stage
  createFilters() {
    this.stage.addChild(this.displacementSprite);

    this.displacementFilter.scale.x = this.displacementFilter.scale.y = this.winWidth / this.imgWidth;

    this.imgContainer.filters = [
      this.displacementFilter
    ]
  }

  // function changes the distortion level to a specific amount
  distortionLevel(amt) {
    if(!this.isTransitioning){
      this.isTransitioning = true;
      TweenLite.to(this.settings, 1, {
        transition: amt,
        speed: this.currentMap.speed,
        dispScale: this.currentMap.scale,
        ease: Power2.easeInOut,
        onComplete: () => {
          this.isTransitioning = false;
        }
      });
    }
  }

  // click events
  eventListener() {
    const changeImageBtn = document.getElementsByClassName('js-change-image')[0];
    const changeDistortionBtn = document.getElementsByClassName('js-change-distortion')[0];
    const toggleDistorionBtn = document.getElementsByClassName('js-toggle-distortion')[0];

    changeImageBtn.onclick = () => {
      this.changeImage();
    }

    changeDistortionBtn.onclick = () => {
      this.changeMap();
    }

    toggleDistorionBtn.onclick = () => {
      this.toggleDistortion();
    }
  }

  // turn the distortion on and off using the options.transistion variable
  toggleDistortion() {
    if(this.isDistorted) {
      this.distortionLevel(0);
      this.isDistorted = false;
    } else {
      this.distortionLevel(1);
      this.isDistorted = true;
    }
  }

  // Object.assign overwrites defaults with options to create settings
  update() {
    this.settings = Object.assign({}, this.defaults, this.options);
  }

// ============ TEAR DOWN =============== //

  tearDown() {
    window.cancelAnimationFrame(this.raf);
    this.settings = {};
    this.bgArray = [];
    this.bgSpriteArray = [];
  }
}
