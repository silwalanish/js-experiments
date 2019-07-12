const GAME_DEFAULT_WIDTH = 300;
const GAME_DEFAULT_HEIGHT = 600;
const GAME_GRAVITY = 0.5;
const GAME_DEFAULT_PIPE_SPEED = 50;
const GAME_DEFAULT_BACKGROUND = "#33a5ff";

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
      return;
    }
    this.highScore = Number(window.localStorage.getItem('flappy-highScore'));
    this.hasSetHighScore = false;

    this.options.backgroundSprite = this.options.backgroundSprite || new Sprite("./images/bg.png", 0, 0);
    this.options.backgroundSprite.createPattern('repeat-x');
    
    this.options.groundSprite = this.options.groundSprite || new Sprite("./images/ground.png", 0, 0);
    this.options.groundSprite.createPattern('repeat-x');

    this.score = 0;
    this.flappy = null;
    this.pipes = [];
    this.isRunning = false;
    this.isPlaying = false;
    this.backgroundOffset = 0;
    this.timer = 0;

    this.el.addEventListener('click', this.onClick.bind(this));

    this.startTime = Date.now();
    this.gameloop();
  }

  onClick (e) {
    if(this.isPlaying && this.flappy && this.flappy.isAlive()){
      this.flappy.moveUp();
    }else if(!this.isRunning){
      this.start();
    }else if(this.isRunning && !this.isPlaying){
      this.isPlaying = true;
      this.flappy.moveUp();
    }
  }

  clear () {
    this.context.beginPath();
    this.context.fillStyle = this.options.background || GAME_DEFAULT_BACKGROUND;
    this.context.fillRect(0, 0, this.width, this.height);
    
    this.context.save();
    this.context.translate(-this.backgroundOffset, this.getGroundPos());
    if(this.options.groundSprite.loaded){
      this.options.groundSprite.draw(this.context, 0, 0, 
        this.width + this.options.groundSprite.sw, this.options.groundSprite.sh);
    }

    if(this.options.backgroundSprite.loaded){
      this.context.translate(0, - this.options.backgroundSprite.sh);
      this.options.backgroundSprite.draw(this.context, 0, 0, 
        this.width + this.options.backgroundSprite.sw, this.options.backgroundSprite.sh);
    }

    this.context.restore();
    this.context.closePath();
  }

  gameloop () {
    let currentTime = Date.now();
    let deltaTime = (currentTime - this.startTime) / 1000;
    this.startTime = currentTime;
    
    this.clear();
    this.draw();
    this.update(deltaTime);
    
    if(this.isRunning){
      this.backgroundOffset += 10 * deltaTime;
      if(this.backgroundOffset > this.options.backgroundSprite.sw){
        this.backgroundOffset = 0;
      }
      
      if(this.isPlaying){
        this.timer += deltaTime;
        if(this.timer >= 4){
          this.timer = 0;
          this.generate();
        }
      }
    }
    
    window.requestAnimationFrame(() => {
      this.gameloop();
    });
  }

  draw () {
    this.pipes.forEach(pipe=>{
    	pipe.draw(this.context);
    });

    if(this.flappy){
      this.flappy.draw(this.context);
    }
    
    if(this.isRunning){
      this.context.beginPath();
      this.context.font = "normal 40px arial";
      this.context.strokeStyle = "#ffffff";
      this.context.strokeText(this.score, this.width / 2, this.height / 4);
      this.context.closePath();
    }else if(this.hasSetHighScore){
      this.context.beginPath();
      this.context.textAlign = "center";
      this.context.font = "normal 30px arial";
      this.context.strokeStyle = "#FFFF00";
      this.context.strokeText("New High Score", this.width / 2, this.height / 4);
      this.context.strokeText(this.score, this.width / 2, this.height / 4 + 35);
      this.context.closePath();
    }

  }

  update (deltaTime) {
    this.updatePipes(deltaTime);
    this.updateFlappy(deltaTime);
  }

  updatePipes (deltaTime) {
    if(this.flappy && this.flappy.isAlive()){
      this.pipes.forEach((pipe, index)=>{
        pipe.update(deltaTime, this.pipeSpeed);
        
        if(pipe.hasGoneOutOfLBounds()){
          this.pipes.splice(index, 1);
        }

        if(pipe.canCollideWith(this.flappy)){
          this.checkAndResolveCollision(pipe);
        }

      });
    }
  }

  updateFlappy (deltaTime) {
    if(this.flappy){
      this.flappy.update(deltaTime, this.gravity, this.isPlaying);
      if(this.flappy.onTheGround() && this.isRunning){
        this.flappy.fainted = true;
        this.gameover();
      }
    }
  }

  checkAndResolveCollision (pipe) {
    let [collision, extent] = pipe.collidesWith(this.flappy);
    if(collision){
      this.flappy.fainted = true;
      this.flappy.x += extent;
    }else if(pipe.scoresPoint(this.flappy)){
      this.score ++;
    }
  }

  start () {
    this.playBtn.style.display = "none";
    this.score = 0;
    this.pipes = [];
    this.gravity = this.options.gravity || GAME_GRAVITY;

    let flyingFlappy = new SpriteAnimation(new Sprite("./images/flappy-sprite-sheet.png", 0, 0, 66, 64), 0, 7, 10);
    let faintedFlappy = new SpriteAnimation(new Sprite("./images/flappy-fainted-sprite-sheet.png", 0, 0, 66, 64), 0, 1, 5);
    this.flappy = new FlappyBird(50, this.getGroundPos() / 3, 60, 66, flyingFlappy, faintedFlappy, this.getGroundPos());

    this.pipeSpeed = this.options.pipeSpeed || GAME_DEFAULT_PIPE_SPEED;

    this.startTime = Date.now();
    this.isRunning = true;
    this.isPlaying = false;
  }
  
  generate () {
    let height = Math.random() * (0.3 * this.height) + 0.1 * this.height;
    let pipe = new PipePair(this.width, height, this.height, this.flappy.height, this.getGroundPos());
    this.pipes.push(pipe);
  }

  pause () {
    this.isRunning = false;
    clearInterval(this.generator);
  }

  resume () {
    this.isRunning = true;
  }

  gameover () {
    this.isRunning = false;
    this.playBtn.style.display = "block";
    if(this.score > this.highScore){
      this.highScore = this.score;
      this.hasSetHighScore = true;
      window.localStorage.setItem('flappy-highScore', this.highScore);
    }
  }

  getGroundPos () {
    return (this.height - this.options.groundSprite.sh);
  }

}
