const GAME_DEFAULT_WIDTH = 300;
const GAME_DEFAULT_HEIGHT = 600;
const GAME_DEFAULT_LANE_WIDTH = GAME_DEFAULT_WIDTH / 3;
const GAME_MIN_SPAWN_SPEED = 600;
const GAME_DEFAULT_START_SPAWN_SPEED = 3000;
const GAME_DEFAULT_LANE_START_HEIHT = 50;
const GAME_DEFAULT_LANE_START_OFFSET = 5;
const GAME_DEFAULT_LANE_START_GAP = 15;

const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const CAR_SPEED = 100;

const KEY_A = 65;
const KEY_D = 68;
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

class Car{

  constructor (game, lane, isPlayer, speed, width, height) {
    this.isPlayer = isPlayer || false;
    
    this.width = width || CAR_WIDTH;
    this.height = height || CAR_HEIGHT;

    this.lane = (lane != "undefined") ? lane: 1;
    this.x = ((this.lane + (1/2)) * game.laneWidth) - (this.width / 2);
    
    this.y = this.isPlayer ? game.height - this.height: -this.height;

    this.speed = speed || CAR_SPEED;
    this.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    this.textureIndex = Math.floor(Math.random() * NUM_TEXTURE);
  }

  calcX () {
    this.x = ((this.lane + (1/2)) * game.laneWidth) - (this.width / 2);
  }

  draw (ctx) {
    ctx.beginPath();
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    if(!this.isPlayer){
      ctx.rotate(Math.PI);
    }
    if(CAR_TEXTURE_LOADED){
      ctx.drawImage(CAR_TEXTURE, (TEXTURE_X  + TEXTURE_WIDTH) * this.textureIndex, TEXTURE_Y, TEXTURE_WIDTH, TEXTURE_HEIGHT, 
        -this.width / 2, -this.height / 2, this.width, this.height);
    }else{
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    ctx.restore();
    ctx.closePath();
  }

  update (deltaTime) {
    if(!this.isPlayer){
      this.y += this.speed * deltaTime;
    }
  }

  collides (car) {
    return this.contains(car.x, car.y) || 
           this.contains(car.x + car.width, car.y) ||
           this.contains(car.x, car.y + car.height) ||
           this.contains(car.x + car.width, car.y + car.height);
  }

  contains (x, y) {
    return (x >= this.x && x <= (this.x + this.width)) && 
           (y >= this.y && y <= (this.y + this.height));
  } 

}

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
      console.log("okay");
      
      this.playBtn.style.display = "none";
    });
    
    this.el.appendChild(this.playBtn);
    this.el.appendChild(this.canvas);

    this.context = this.canvas.getContext('2d');

    document.addEventListener('keydown', (e) => {
      this.keyPress(e);
    });

    this.clear();
  }

  keyPress (e) {
    if((e.keyCode === KEY_A || e.keyCode == KEY_LEFT) && this.player.lane > 0){
      this.player.lane --;
      this.player.calcX();
    }else if((e.keyCode === KEY_D || e.keyCode == KEY_RIGHT) && this.player.lane < 2){
      this.player.lane ++;
      this.player.calcX();
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

  gameloop () {
    if(this.playing){
      let currentTime = Date.now();
      let deltaTime = (currentTime - this.startTime) / 1000;
      this.startTime = currentTime;
      this.clear();
      this.update(deltaTime);
      this.draw();
    }else{
      clearTimeout(this.generator);
    }

    window.requestAnimationFrame(() => {
      this.gameloop();
    });
  }

  draw () {
    this.cars.forEach(car => {
      car.draw(this.context);
    });
    
    this.context.beginPath();
    this.context.font = "normal 15px arial";
    this.context.strokeStyle = "#ffffff";
    this.context.strokeText(this.score, 10, 30);
    this.context.strokeText(this.carSpeed + "mps", this.width / 2 - 30, 30);
    this.context.strokeText(this.spawnSpeed / 1000 + "sec", this.width - 80, 30);
    this.context.closePath();
  }

  update (deltaTime) {
    this.cars.forEach((car, index) => {
      car.update(deltaTime);
      if(car != this.player && car.lane == this.player.lane){
        if(car.collides(this.player)){
          this.gameover();
        }
      }else if(car.y > this.height){
        this.score += 100;
        this.carSpeed += 5;
        if(this.spawnSpeed > GAME_MIN_SPAWN_SPEED){
          this.spawnSpeed -= 50;
        }
        
        this.cars.splice(index, 1);
      }
    });
    
    this.laneOffset += this.carSpeed * deltaTime;
  }

  start () {
    this.playing = true;
    
    this.laneHeight = this.options.laneHeight || GAME_DEFAULT_LANE_START_HEIHT;
    this.laneWidth = this.options.laneWidth || GAME_DEFAULT_LANE_WIDTH;
    this.laneOffset = this.options.laneOffset || GAME_DEFAULT_LANE_START_OFFSET;
    this.laneGap = this.options.laneGap || GAME_DEFAULT_LANE_START_GAP;

    this.player = new Car(this, 1, true);
    this.cars = [ this.player ];
    this.carSpeed = this.options.carSpeed || CAR_SPEED;
    this.spawnSpeed = GAME_DEFAULT_START_SPAWN_SPEED;
    this.score = 0;
    
    this.generateCars();
    
    this.startTime = Date.now();
    this.gameloop();
  }

  pause () {
    this.playing = false;
    clearTimeout(this.generator);
  }

  resume () {
    this.playing = true;
    this.generateCars();
  }

  gameover () {
    this.playing = false;
    this.playBtn.style.display = "block";
    this.score = 0;
  }

}