const CAR_WIDTH = 50;
const CAR_HEIGHT = 80;
const CAR_SPEED = 100;

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

  moveLeft () {
    this.lane --;
    this.calcX();
  }

  moveRight () {
    this.lane ++;
    this.calcX();
  }

}
