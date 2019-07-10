class Pipe{
	
	constructor(game, height, top){
		this.game=game;
		this.height=height;
		this.top = top || false;
		this.x = this.game.width;
		this.y = (this.top)?0: this.game.height-this.height;
		this.width= 20;
		
	}
	
	draw (ctx){
		ctx.beginPath();
		ctx.fillStyle = "#00f";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.closePath();
	}
	
	update (deltaTime){
		this.x-=50*deltaTime;
	}
	
}
