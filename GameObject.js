var GameObject = {};

GameObject.make = function(ctx, image, defaultX, defaultY, rangeX, rangeY, speed, defaultOrientation){
	return new GameObjectElement(ctx, image, defaultX, defaultY, rangeX, rangeY, speed, defaultOrientation);
};

GameObject.rectangleCollide = function (goe1, goe2) {
	var data = {};
	data.x3 = goe1.x + goe1.width;
	data.y3 = goe1.y + goe1.height;
	data.x4 = goe2.x + goe2.width;
	data.y4 = goe2.y + goe2.height;
	
	data.minX = Math.min(goe1.x, goe2.x);
	data.minY = Math.min(goe1.y, goe2.y);
	data.maxX = Math.max(data.x3, data.x4);
	data.maxY = Math.max(data.y3, data.y4);
	
	data.width = data.maxX - data.minX;
	data.height = data.maxY - data.minY;
	if(data.width < (goe1.width + goe2.width) && data.height < (goe1.height + goe2.height))
		return data;
	return false;
};

GameObject.collide = function (width, height, goe1, goe2) {
	var data = GameObject.rectangleCollide(goe1, goe2);
	if(data !== false) {
		return GameObject.pixelCollide(width, height, goe1, goe2, data);
	}
	return false;
};

GameObject.calculatePixel = function (ctx, x, y, w, h) {
	var sum = 0;
	var data = ctx.getImageData(x, y, w, h);//ctx.getImageData(0, 0, c.width, c.height);
	data = data.data;
	for(var i = 3;i < data.length;i+=4) {//3, 7, 11, 15...
		if(data[i] !== 0)
			sum++;
	}
	return sum;
};

GameObject.canvas = document.createElement("canvas");

GameObject.pixelCollide = function (width, height, goe1, goe2, data) {
	GameObject.canvas.width = width;
	GameObject.canvas.height = height;
	
	if(data.minX < 0)
		data.minX = 0;
	if(data.minY < 0)
		data.minY = 0;
	
	var ctx = GameObject.canvas.getContext("2d");
	
	ctx.clearRect(0, 0, width, height);
	goe1.draw(ctx);
	var a = GameObject.calculatePixel(ctx, data.minX, data.minY, data.width, data.height);
	
	ctx.clearRect(0, 0, width, height);
	goe2.draw(ctx);
	var b = GameObject.calculatePixel(ctx, data.minX, data.minY, data.width, data.height);
	
	ctx.clearRect(0, 0, width, height);
	goe1.draw(ctx);
	goe2.draw(ctx);
	var c = GameObject.calculatePixel(ctx, data.minX, data.minY, data.width, data.height);
		
	if(c < (a + b))
		return true;
	return false;
};

GameObject.imageToCanvas = function (image) {
	var t = document.createElement("canvas");
	t.width = image.width;
	t.height = image.height;
	var ctx = t.getContext("2d");
	ctx.drawImage(image, 0, 0);
	return t;
};

function GameObjectElement(ctx, image, defaultX, defaultY, rangeX, rangeY, speed, defaultOrientation){
	this.ctx = ctx;
	this.image = image;
	this.x = defaultX - this.image.width/2;
	this.y = defaultY - this.image.height/2;
	this.rangeX = rangeX;
	this.rangeY = rangeY;
	this.direction = defaultOrientation;
	this.speed = speed;
	this.width = this.image.width;
	this.height = this.image.height;
}

GameObjectElement.prototype.go = function (s) {
	if(s === undefined)
		s = this.speed;

	this.y += Math.cos(this.direction)*s;
	this.x -= Math.sin(this.direction)*s;
	
	this.out = false;
	
	if(this.x < -this.width/2) {
		this.x = -this.width/2;
		this.out = true;
	}
	if(this.x+this.width/2 > this.rangeX) {
		this.x = this.rangeX-this.width/2;
		this.out = true;
	}
	if(this.y < -this.height/2) {
		this.y = -this.height/2;
		this.out = true;
	}
	if(this.y+this.height/2 > this.rangeY) {
		this.y = this.rangeY-this.height/2;
		this.out = true;
	}
};

GameObjectElement.prototype.back = function (s) {
	if(s === undefined)
		s = this.speed;

	this.y -= Math.cos(this.direction)*s;
	this.x += Math.sin(this.direction)*s;
	
	this.out = false;
	
	if(this.x < -this.width/2) {
		this.x = -this.width/2;
		this.out = true;
	}
	if(this.x+this.width/2 > this.rangeX) {
		this.x = this.rangeX-this.width/2;
		this.out = true;
	}
	if(this.y < -this.height/2) {
		this.y = -this.height/2;
		this.out = true;
	}
	if(this.y+this.height/2 > this.rangeY) {
		this.y = this.rangeY-this.height/2;
		this.out = true;
	}
};

GameObjectElement.prototype.west = function () {
	this.direction = Math.PI * 0.5;
};

GameObjectElement.prototype.east = function () {
	this.direction = Math.PI * 1.5;
};

GameObjectElement.prototype.north = function () {
	this.direction = Math.PI * 1;
};

GameObjectElement.prototype.south = function () {
	this.direction = 0;
};

GameObjectElement.prototype.northwest = function () {
	this.direction = Math.PI * 0.75;
};

GameObjectElement.prototype.northeast = function () {
	this.direction = Math.PI * 1.25;
};

GameObjectElement.prototype.southwest = function () {
	this.direction = Math.PI * 0.25;
};

GameObjectElement.prototype.southeast = function () {
	this.direction = Math.PI * 1.75;
};

GameObjectElement.prototype.draw = function (ctx) {
	if(ctx === undefined)
		ctx = this.ctx;
	if(this.direction === 0) {
		ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, this.width, this.height);
	} else {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.translate(this.width/2, this.height/2);
		ctx.rotate(this.direction);
		ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, -this.width/2, -this.height/2, this.width, this.height);
		ctx.restore();
	}
};

var GameAudioObject = {};

GameAudioObject.make = function (audio, start, length) {
	return new GameAudioObjectElement(audio, start, length);
};

function GameAudioObjectElement (audio, start, length) {
	this.audio = audio;
	if(start !== undefined)
		this.start = start;
	else
		this.start = 0;
	if(length !== undefined)
		this.length = length;
	else
		this.length = -1;
}

GameAudioObjectElement.prototype.play = function () {
	if(this.audio.paused === false)
		this.audio.pause();
	this.audio.currentTime = this.start;
	this.audio.play();
	if(this.length !== -1)
	var self = this;
	setTimeout(function () {
		self.audio.pause();
	}, length);
};