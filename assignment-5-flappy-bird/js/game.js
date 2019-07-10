const GAME_DEFAULT_WIDTH = 300;
const GAME_DEFAULT_HEIGHT = 600;
const GAME_GRAVITY = 0.2;


const BACKGROUND_IMAGE = new Image();
var BACKGROUND_IMAGE_LOADED = false;
BACKGROUND_IMAGE.onload = () => {
  BACKGROUND_IMAGE_LOADED = true;
};
BACKGROUND_IMAGE.src = "./images/bg.png";

class Game{

  constructor (el, options){
    if(!el){
      throw new Error("el is required");
    }
    this.el = el;

    this.options = options || {};

    this.width = this.options.width || GAME_DEFAULT_WIDTH;
    this.height = this.options.height || GAME_DEFAULT_HEIGHT;
    
    this.init();
  }

  init () {
    this.el.style.position = "relative";
    this.el.style.width = this.width + "px";
    this.el.style.height = this.height + "px";

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.playBtn = document.createElement('button');
    this.playBtn.textContent = "Play";
    this.playBtn.style.position = "absolute";
    this.playBtn.style.top = "50%";
    this.playBtn.style.left = "50%";
    this.playBtn.style.transform = "translate(-50%, -50%)";
    this.playBtn.addEventListener('click', () => { 
      this.start(); 
    });
    
    this.el.appendChild(this.playBtn);
    this.el.appendChild(this.canvas);

    this.context = this.canvas.getContext('2d');
    if(! this.context){
    	document.write("canvas not supported");
    }

    document.addEventListener('keydown', (e) => {
      this.keyPress(e);
    });

    this.flappy = null;
    this.pipes = [];
    this.playing = false;
    this.backgroundOffset = 0;

    this.el.addEventListener('click', this.click.bind(this));

    this.gameloop();
  }

  keyPress (e) {
    
  }

  click (e) {
    if(this.playing && this.flappy){
      this.flappy.speed = -5;
    }else{
      this.start();
    }
  }

  clear () {
    this.context.beginPath();
    this.context.fillStyle = this.options.background || "#000000";
    this.context.fillRect(0, 0, this.width, this.height);
    if(BACKGROUND_IMAGE_LOADED){
      this.context.save();
      this.context.translate(-this.backgroundOffset, 0);
      this.context.fillStyle = this.context.createPattern(BACKGROUND_IMAGE, "repeat-x");
      this.context.fillRect(0, 0, this.width + BACKGROUND_IMAGE.width, this.height);  
      this.context.restore();
    }
    
    this.context.closePath();
  }

  gameloop () {
    let currentTime = Date.now();
    let deltaTime = (currentTime - this.startTime) / 1000;
    this.startTime = currentTime;
    
    this.clear();
    if(this.playing){
      this.update(deltaTime);
      this.draw();
    }
    
    this.backgroundOffset += 10 * deltaTime;
    if(this.backgroundOffset > BACKGROUND_IMAGE.width){
      this.backgroundOffset = 0;
    }
    
    window.requestAnimationFrame(() => {
      this.gameloop();
    });
  }

  draw () {
    this.pipes.forEach(pipe=>{
    	pipe.draw(this.context);
    });
    this.flappy.draw(this.context);
    
    this.context.beginPath();
    this.context.font = "normal 15px arial";
    this.context.strokeStyle = "#ffffff";
    this.context.strokeText(this.score, 10, 30);
    this.context.closePath();
  }

  update (deltaTime) {
    this.pipes.forEach(pipe=>{
    	pipe.update(deltaTime);
    })
    this.flappy.update(deltaTime);
    if(!this.flappy.isAlive()){
      this.gameover();
    }

  }

  start () {
    this.playBtn.style.display = "none";
    this.score = 0;
    this.backgroundOffset = 0;
    this.pipes = [];
    this.gravity = this.options.gravity || GAME_GRAVITY;

    let flyingFlappy = new SpriteAnimation(new Sprite("./images/flappy-sprite-sheet.png", 0, 0, 66, 64), 0, 7, 10);
    let dazalledFlappy = new SpriteAnimation(new Sprite("./images/flappy-dazalled-sprite-sheet.png", 0, 0, 66, 64), 0, 1, 5);
    this.flappy = new FlappyBird(this, 50, 50, 60, 66, flyingFlappy, dazalledFlappy);

    this.startTime = Date.now();
    this.playing = true;
    this.generator = setInterval(this.generate.bind(this), 3000);
  }
  
  generate () {
    let n = Math.round(Math.random())+1;
    console.log(n);
    for(let i=0; i<n;i++){
      this.pipes.push(new Pipe(this, Math.max(150, Math.random()*250), i || false));
    }
  }

  pause () {
    this.playing = false;
    clearInterval(this.generator);
  }

  resume () {
    this.playing = true;
    this.generator = setInterval(this.generate.bind(this), 3000);
  }

  gameover () {
    clearInterval(this.generator);
    this.playing = false;
    this.playBtn.style.display = "block";

    this.score = 0;
  }

}
