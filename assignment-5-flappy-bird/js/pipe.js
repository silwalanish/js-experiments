const SPRITE_TOP_HEIGHT = 20;
const SPRITE_TOP_OFFSET = 5;

class PipePair {

	constructor (startX, height, gameHeight, flappyHeight, groundPos) {
		this.pipeTop = new Pipe(startX, height, true);
		this.pipeBottom = new Pipe(startX, gameHeight - height - 3.5 * flappyHeight, false, groundPos);
		this.scoreAdded = false;
	}

	draw (ctx) {
		this.pipeTop.draw(ctx);
		this.pipeBottom.draw(ctx);
	}

	update (deltaTime, pipeSpeed) {
		this.pipeTop.update(deltaTime, pipeSpeed);
		this.pipeBottom.update(deltaTime, pipeSpeed);
	}

	canCollideWith (flappy) {
		return this.pipeTop.x <= (flappy.x + flappy.width);
	}

	collidesWith (flappy) {
		let collision = this.pipeTop.collider.collidesWith(flappy.collider);
		let extent = 0;
		if(collision){
			extent = this.pipeTop.collider.collisionExtent(flappy.collider);
			return [collision, extent]
		}

		collision = this.pipeBottom.collider.collidesWith(flappy.collider);
		if(collision){
			extent = this.pipeBottom.collider.collisionExtent(flappy.collider);
			return [collision, extent];
		}
		return [false, 0];
	}

	scoresPoint (flappy) {
		if(this.pipeTop.x + this.pipeTop.width / 2 <= flappy.x && !this.scoreAdded){
			this.scoreAdded = true;
			return true;
		}
		return false;
	}

	hasGoneOutOfLBounds () {
		return (this.pipeTop.x + this.pipeTop.width <= 0);
	}

}

class Pipe{
	
	constructor(startX, height, top, groundPos){
		this.height = height;
		this.top = top || false;
		this.x = startX;
		this.y = (this.top) ? 0: groundPos - this.height;
		this.width = 50;
		this.spriteTop = new Sprite("./images/pipe-top.png", 0, 0);
		this.spriteBody = new Sprite("./images/pipe-body.png", 0, 0);
		this.collider = new Collider(this);
	}
	
	draw (ctx){
		ctx.beginPath();
		ctx.save();
		if(!this.spriteTop.loaded || !this.spriteBody.loaded){
			ctx.fillStyle = "#00f";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}else{
			this.spriteTop.draw(ctx, this.x - SPRITE_TOP_OFFSET, this.y + ( (this.top) ?  (this.height - SPRITE_TOP_HEIGHT) : 0 ), this.width + SPRITE_TOP_OFFSET * 2, SPRITE_TOP_HEIGHT);
			this.spriteBody.draw(ctx, this.x, this.y + SPRITE_TOP_HEIGHT * ( (this.top) ? 0 : 1), this.width, this.height - SPRITE_TOP_HEIGHT);
		}
		ctx.restore();
		ctx.closePath();
	}
	
	update (deltaTime, pipeSpeed){
		this.x -= pipeSpeed * deltaTime;
    this.collider.update(deltaTime);
	}
	
}
