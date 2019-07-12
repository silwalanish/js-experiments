const GAME_DEFAULT_WIDTH = 300;
const GAME_DEFAULT_HEIGHT = 600;
const GAME_DEFAULT_LANE_WIDTH = GAME_DEFAULT_WIDTH / 3;
const GAME_MIN_SPAWN_SPEED = 600;
const GAME_DEFAULT_START_SPAWN_SPEED = 3000;
const GAME_DEFAULT_LANE_START_HEIHT = 50;
const GAME_DEFAULT_LANE_START_OFFSET = 5;
const GAME_DEFAULT_LANE_START_GAP = 15;

const KEY_A = 65;
const KEY_D = 68;
const KEY_F = 70;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;

const CAR_TEXTURE = new Image();
var CAR_TEXTURE_LOADED = false;
CAR_TEXTURE.onload = () => {
  CAR_TEXTURE_LOADED = true;
};
CAR_TEXTURE.src = "./images/cars-spritesheet.png";

const NUM_TEXTURE = 5;
const TEXTURE_X = 2;
const TEXTURE_Y = 4;
const TEXTURE_WIDTH = 72;
const TEXTURE_HEIGHT = 122;

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
      this.playBtn.style.display = "none";
    });
    
    this.el.appendChild(this.playBtn);
    this.el.appendChild(this.canvas);

    this.context = this.canvas.getContext('2d');
    if(! this.context){
      document.write("canvas not supported");
      return;
    }
    this.highScore = Number(window.localStorage.getItem('highScore'));
    this.hasSetHighScore = false;

    document.addEventListener('keydown', (e) => {
      this.keyPress(e);
    });

    this.clear();
  }

  keyPress (e) {
    if(this.isPlaying){
      if((e.keyCode === KEY_A || e.keyCode == KEY_LEFT) && this.player.lane > 0){
        this.player.moveLeft();
      }else if((e.keyCode === KEY_D || e.keyCode == KEY_RIGHT) && this.player.lane < 2){
        this.player.moveRight();
      }

      if(e.keyCode === KEY_F){
       this.spawnBullet(); 
      }
    }
  }

  clear () {
    this.context.beginPath();
    this.context.fillStyle = this.options.background || "#000000";
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.closePath();

    this.context.beginPath();
    this.context.strokeStyle = "#ffffff";
    this.context.moveTo(this.laneWidth, 0);
    this.context.lineTo(this.laneWidth, this.height);
    
    this.context.moveTo(2 * this.laneWidth, 0);
    this.context.lineTo(2 * this.laneWidth, this.height);

    this.context.setLineDash([this.laneHeight, this.laneGap]);
    this.context.lineDashOffset = -this.laneOffset;
    this.context.stroke();
    this.context.setLineDash([]);
    this.context.closePath();
  }

  spawnBullet () {
    let bullet = new Bullet(this, this.player.x + this.player.width / 2, this.player.y);  
    this.bullets.push(bullet);
  }

  generateCars () {
    let numCars = Math.floor(Math.random() * 2) + 1;
    
    let lastCar;
    for(let i = 0; i < numCars; i++){
      let lane =  Math.floor(Math.random() * 3);
      while(lastCar && lastCar.lane === lane){
        lane =  Math.floor(Math.random() * 3);
      }
      lastCar = new Car(this, lane, false, this.carSpeed);
      this.cars.push(lastCar);
    }

    this.generator = setTimeout(() => {
      this.generateCars();
    }, this.spawnSpeed);
  }

  addScore (score) {
    this.score += score;
    if (this.score % 500 == 0) {
      //this.carSpeed += 50; 
      
      if(this.spawnSpeed > GAME_MIN_SPAWN_SPEED){
        this.spawnSpeed -= 200;
      }
    }
  }

  gameloop () {
      let currentTime = Date.now();
      let deltaTime = (currentTime - this.startTime) / 1000;
      this.startTime = currentTime;
      this.clear();
      
      this.draw();

    if(this.isPlaying){
      this.update(deltaTime);
    }else{
      clearTimeout(this.generator);
    }

    window.requestAnimationFrame(() => {
      this.gameloop();
    });
  }

  draw () {
    this.bullets.forEach(bullet => {
      bullet.draw(this.context);
    });

    this.cars.forEach(car => {
      car.draw(this.context);
    });
    
    this.context.beginPath();
    this.context.textAlign = "center";
    this.context.font = "normal 15px arial";
    this.context.strokeStyle = "#ffffff";
    this.context.strokeText(this.score, this.laneWidth / 2, 30);
    this.context.strokeText(this.carSpeed + "mps", 3 * this.laneWidth / 2, 30);
    this.context.strokeText(this.spawnSpeed / 1000 + "sec", 5 * this.laneWidth / 2, 30);
    this.context.closePath();

    if(this.hasSetHighScore){
      this.context.beginPath();
      this.context.textAlign = "center";
      this.context.font = "normal 30px arial";
      this.context.strokeStyle = "#FFFF00";
      this.context.strokeText("New High Score", this.width / 2, this.height / 4);
      this.context.strokeText(this.score, this.width / 2, this.height / 4 + 35);
      this.context.closePath();
    }else if(this.isPlaying){
      this.context.beginPath();
      this.context.textAlign = "center";
      this.context.font = "normal 30px arial";
      this.context.strokeStyle = "#FFFF00";
      this.context.strokeText(this.score, this.width / 2, this.height / 4 + 35);
      this.context.closePath();
    }
  }

  update (deltaTime) {
    this.updateBullets(deltaTime);
    this.updateCars(deltaTime);
    
    this.laneOffset += (this.carSpeed - 5) * deltaTime;
  }

  updateBullets (deltaTime) {
    for(let i = 0; i < this.bullets.length; i++){
      let bullet = this.bullets[i];
      bullet.update(deltaTime);
      if(!bullet.isAlive()){
        this.bullets.splice(i, 1);
        i--;
      }
    }
  }

  updateCars (deltaTime) {
    for(let i = 0; i < this.cars.length; i++){
      let car = this.cars[i];
      car.update(deltaTime);
      if(car != this.player){
        
        if(this.checkBulletCollision(car)){
          this.cars.splice(i, 1);
          i--;
          this.addScore(50);
        }else{
          if(car.lane == this.player.lane){
            if(car.collides(this.player)){
              this.gameover();
            }
          }else if(car.y > this.height){
            this.addScore(100);
            this.cars.splice(i, 1);
            i--;
          }
        }

      }
    }
  }

  checkBulletCollision (car) {
    for(let j = 0; j < this.bullets.length; j++){
      let bullet = this.bullets[j];
      if(car.contains(bullet.x, bullet.y)){
        this.addScore(50);
        this.bullets.splice(j, 1);
        return true;
      }
    }
    return false;
  }

  start () {
    this.isPlaying = true;
    this.hasSetHighScore = false;
    
    this.laneHeight = this.options.laneHeight || GAME_DEFAULT_LANE_START_HEIHT;
    this.laneWidth = this.options.laneWidth || GAME_DEFAULT_LANE_WIDTH;
    this.laneOffset = this.options.laneOffset || GAME_DEFAULT_LANE_START_OFFSET;
    this.laneGap = this.options.laneGap || GAME_DEFAULT_LANE_START_GAP;

    this.player = new Car(this, 1, true);
    this.cars = [ this.player ];
    this.carSpeed = this.options.carSpeed || CAR_SPEED;
    this.spawnSpeed = GAME_DEFAULT_START_SPAWN_SPEED;

    this.bullets = [];
    this.score = 0;
    
    this.generateCars();
    
    this.startTime = Date.now();
    this.gameloop();
  }

  pause () {
    this.isPlaying = false;
    clearTimeout(this.generator);
  }

  resume () {
    this.isPlaying = true;
    this.generateCars();
  }

  gameover () {
    this.isPlaying = false;
    this.playBtn.style.display = "block";
    if(this.score > this.highScore){
      this.highScore = this.score;
      this.hasSetHighScore = true;
      window.localStorage.setItem('highScore', this.highScore);
    }
  }

}