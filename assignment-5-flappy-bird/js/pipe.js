const SPRITE_TOP_HEIGHT = 20;
const SPRITE_TOP_OFFSET = 5;

class PipePair {

	constructor (game, height) {
		this.game = game;
		this.pipeTop = new Pipe(this.game, height, true);
		this.pipeBottom = new Pipe(this.game, this.game.height - height - 4 * this.game.flappy.height);
		this.scoreAdded = false;
	}

	draw (ctx) {
		this.pipeTop.draw(ctx);
		this.pipeBottom.draw(ctx);
	}

	update (deltaTime) {
		this.pipeTop.update(deltaTime);
		this.pipeBottom.update(deltaTime);
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

	isOutOfLeftBounds () {
		return (this.pipeTop.x + this.pipeTop.width <= 0);
	}

}

class Pipe{
	
	constructor(game, height, top){
		this.game = game;
		this.height = height;
		this.top = top || false;
		this.x = this.game.width;
		this.y = (this.top) ? 0: this.game.height - this.height - this.game.options.groundSprite.sh;
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
	
	update (deltaTime){
		this.x -= this.game.pipeSpeed * deltaTime;
    this.collider.update(deltaTime);
	}
	
}
