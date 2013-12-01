function PlaneGame (CanvasName) {
	this.LoadResource();
	this.init();
	
	this.canvas = document.getElementById(CanvasName);
	this.ctx = this.canvas.getContext("2d");
	this.height = this.canvas.height;
	this.width = this.canvas.width;

	this.cbuf = document.createElement("canvas");
	this.cbuf.width = this.width;
	this.cbuf.height = this.height;
	this.ctxbuf = this.cbuf.getContext("2d");
	
	this.ShowStartup();
}

PlaneGame.prototype.init = function () {
	this.fps = 60;
	this.skip = 1000 / this.fps - 1;
	this.score = 0;
	this.keyState = {left:0,up:0,right:0,down:0,fire:0};
	
	this.playerBullet = [];
	this.enemyPlane = [];
	this.enemyBullet = [];
	
	this.playerPlane = GameObject.make(this.ctxbuf, this.resource.playerPlane, this.width/2, this.height*0.9, this.width, this.height, 4, 0);
	this.playerPlane.bulletCool = 0;
	
	this.playerPlane.x = this.width/2;
	this.playerPlane.y = this.height*0.9;
	
	this.startflag = false;
};

PlaneGame.prototype.LoadResource = function () {
	var self = this;
	this.resource = {};
	
	var img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "plane.png";
	this.resource.playerPlane = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "planebullet.png";
	this.resource.playerBullet = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "explosion.png";
	this.resource.explosion = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "enemyplane1.png";
	this.resource.enemyPlane1 = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "enemybullet1.png";
	this.resource.enemyBullet1 = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "enemyplane2.png";
	this.resource.enemyPlane2 = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "enemybullet2.png";
	this.resource.enemyBullet2 = img;
	
	img = new Image();
	img.onload = function () {
		self.ShowStartup();
	};
	img.src = "background.gif";
	this.resource.background = img;
	

	var audio = new Audio();
	var audiotype = "none";
	if(audio.canPlayType("audio/ogg")) {
		audiotype = "ogg";
	} else if(audio.canPlayType("audio/mpeg")) {
		audiotype = "mp3";
	}
	if(audiotype !== "none") {
		audio = document.getElementById(audiotype + "bullet");
		this.resource.audioBullet = GameAudioObject.make(audio, 0.3, 100);
		
		audio = document.getElementById(audiotype + "explosion");
		this.resource.audioExplosion = GameAudioObject.make(audio, 1.2, 200);
	}
};

PlaneGame.prototype.MainLoop = function () {
	this.DrawBackground();	
	this.ctxbuf.fillText("SCORE : " + this.score, 10, 20);

	//Calculate player's move
	if(this.keyState.west === 1 && this.keyState.north === 1) {// left up
		this.playerPlane.northwest();
		this.playerPlane.go();
	} else if(this.keyState.north === 1 && this.keyState.east === 1) {// right up
		this.playerPlane.northeast();
		this.playerPlane.go();
	} else if(this.keyState.east === 1 && this.keyState.south === 1) {// right down
		this.playerPlane.southeast();
		this.playerPlane.go();
	} else if(this.keyState.south === 1 && this.keyState.west === 1) {// left down
		this.playerPlane.southwest();
		this.playerPlane.go();
	} else if(this.keyState.west === 1) {// just left
		this.playerPlane.west();
		this.playerPlane.go();
	} else if(this.keyState.north === 1) {// just up
		this.playerPlane.north();
		this.playerPlane.go();
	} else if(this.keyState.east === 1) {// just right
		this.playerPlane.east();
		this.playerPlane.go();
	} else if(this.keyState.south === 1) {// just down
		this.playerPlane.south();
		this.playerPlane.go();
	}
	
	this.playerPlane.direction = 0;
	
	//Add enemyPlane1
	if((Math.random() < 0.025 && this.enemyPlane.length <= 8) || this.enemyPlane.length < 1) {
		var t = GameObject.make(this.ctxbuf, this.resource.enemyPlane1, Math.random() * this.width, 0, this.width, this.height, 1.5, 0);
		t.bullet = this.resource.enemyBullet1;
		t.bulletCoolMax = 50;//Bullet fire speed
		t.bulletSpeed = 2;
		t.bulletCool = t.bulletCoolMax;
		t.hp = 1;//Hit point
		t.score = 1;
		this.enemyPlane.push(t);
	}
	
	//Add enemyPlane2
	if(Math.random() < 0.0025 && this.enemyPlane.length <= 8) {
		var t = GameObject.make(this.ctxbuf, this.resource.enemyPlane2, Math.random() * this.width, 0, this.width, this.height, 1, 0);
		t.bullet = this.resource.enemyBullet2;
		t.bulletCoolMax = 40;
		t.bulletSpeed = 4;
		t.bulletCool = t.bulletCoolMax;
		t.hp = 3;
		t.score = 2;
		this.enemyPlane.push(t);
	}
	
	//Player fire
	if(this.keyState.fire === 1 || this.keyState.mousefire === 1) {
		if(this.playerPlane.bulletCool === 0) {
			var t = GameObject.make(this.ctxbuf, this.resource.playerBullet, this.playerPlane.x + this.playerPlane.width/2, this.playerPlane.y + this.playerPlane.height/2, this.width, this.height, 6, 0);
			t.go();
			this.playerBullet.push(t);
			this.playerPlane.bulletCool = 10;//Player fire speed
			this.resource.audioBullet.play();
		} else {
			this.playerPlane.bulletCool--;
		}
	}
	
	//Draw enemy
	for(var i = 0;i < this.enemyPlane.length;i++) {
		if(Math.random() < 0.2) {
			if(Math.random() > 0.5)
				this.enemyPlane[i].southwest();
			else
				this.enemyPlane[i].southeast();
		} else {
			this.enemyPlane[i].south();
		}
		this.enemyPlane[i].go();
		
		if(this.enemyPlane[i].death !== undefined) {
			if(this.enemyPlane[i].death === 0) {
				this.enemyPlane.splice(i, 1);
				i--;
			} else {
				this.enemyPlane[i].death--;
				this.enemyPlane[i].draw();
			}
			continue;
		}
		
		if(GameObject.collide(this.width, this.height, this.enemyPlane[i], this.playerPlane)) {
			
			this.enemyPlane[i].image = this.resource.explosion;
			this.enemyPlane[i].ctx = this.ctx;
			this.enemyPlane[i].draw();
			this.playerPlane.image = this.resource.explosion;
			this.playerPlane.ctx = this.ctx;
			this.playerPlane.draw();
			this.resource.audioExplosion.play();
			
			this.ShowGameOver();
			this.startflag = false;
			return;
		}
		
		if(this.enemyPlane[i].out) {
			this.enemyPlane.splice(i, 1);
			i--;
			continue;
		} else {
			var x1;
			var y1;
			var x2;
			var y2;
			var angle
			
			if(this.playerPlane.y > this.enemyPlane[i].y) {
				x1 = this.playerPlane.x - this.enemyPlane[i].x;
				y1 = this.playerPlane.y - this.enemyPlane[i].y;
				x2 = 0;
				y2 = this.playerPlane.y - this.enemyPlane[i].y;
			
				angle = (x1*x2)+(y1*y2) / (Math.sqrt(x1*x1 + y1*y1) * Math.sqrt(x2*x2 + y2*y2));
				angle = Math.acos(angle);
			
				if(this.playerPlane.x > this.enemyPlane[i].x)
					angle = -angle;
			} else {
				x1 = this.enemyPlane[i].x - this.playerPlane.x;
				y1 = this.enemyPlane[i].y - this.playerPlane.y;
				x2 = 0;
				y2 = this.enemyPlane[i].y - this.playerPlane.y;
			
				angle = (x1*x2)+(y1*y2) / (Math.sqrt(x1*x1 + y1*y1) * Math.sqrt(x2*x2 + y2*y2));
				angle = Math.acos(angle) + Math.PI;
			
				if(this.playerPlane.x < this.enemyPlane[i].x)
					angle = -angle;
			}
			
			this.enemyPlane[i].direction = angle;
			
			this.enemyPlane[i].draw();
			
			//Enemy fire
			if(this.enemyPlane[i].bulletCool === 0 && Math.random() < 0.9) {
				var t = GameObject.make(this.ctxbuf, this.enemyPlane[i].bullet, this.enemyPlane[i].x + this.enemyPlane[i].width/2, this.enemyPlane[i].y + this.enemyPlane[i].height/2, this.width, this.height, this.enemyPlane[i].bulletSpeed, angle);
				t.go(this.enemyPlane[i].bullet.height/2);
				this.enemyBullet.push(t);
				this.enemyPlane[i].bulletCool = this.enemyPlane[i].bulletCoolMax;//Enemy fire speed
			} else {
				this.enemyPlane[i].bulletCool--;
			}
		}
	}
	
	//Draw enemy's bullet
	for(var i = 0;i < this.enemyBullet.length;i++) {
		this.enemyBullet[i].go();
		//Test destroy player
		if(GameObject.collide(this.width, this.height, this.enemyBullet[i], this.playerPlane)) {
			
			this.playerPlane.image = this.resource.explosion;
			this.playerPlane.ctx = this.ctx;
			this.playerPlane.draw();
					
			this.resource.audioExplosion.play();
			
			this.ShowGameOver();
			this.startflag = false;
			return;
		}
		
		if(this.enemyBullet[i].out) {
			this.enemyBullet.splice(i, 1);
			i--;
		} else {
			this.enemyBullet[i].draw();
		}
	}
	
	//Draw player's bullet
	for(var i = 0;i < this.playerBullet.length;i++) {
		this.playerBullet[i].north();
		this.playerBullet[i].go();
		
		//Test bullet to destroy enemy
		var hit = false;
		for(var j = 0;j < this.enemyPlane.length;j++) {
			if(this.enemyPlane[j].death !== undefined)
				continue;
			if(GameObject.collide(this.width, this.height, this.playerBullet[i], this.enemyPlane[j])) {
				this.enemyPlane[j].hp--;
				
				if(this.enemyPlane[j].hp <= 0) {
					this.enemyPlane[j].death = 15;//Dead time
					this.enemyPlane[j].image = this.resource.explosion;
					this.score += this.enemyPlane[j].score;
					
					this.resource.audioExplosion.play();
				}
				
				hit = true;
				this.playerBullet.splice(i, 1);
				i--;
				break;
			}
		}
		
		if(hit === false) {
			if(this.playerBullet[i].out) {
				this.playerBullet.splice(i, 1);
				i--;
				continue;
			}
			
			this.playerBullet[i].draw();
		}
	}
	
	//Draw player
	this.playerPlane.draw();
	
	this.count++;
	
	ntime = (new Date()).getTime();
	ntime = (this.count / ((ntime - this.stime) / 1000));
	
	this.ctxbuf.fillText(ntime.toFixed(2), this.width - 40, 20);
	
	if(this.count === 1000) {
		this.stime = (new Date()).getTime() - 1000;
		this.count = 60;
	}
	
	this.ctx.drawImage(this.cbuf, 0, 0);

	var self = this;
	
	if(this.startflag === true) {
		setTimeout(function () {
			self.MainLoop();
		}, this.skip);
	} else {
		this.ShowGameOver();
	}
};

PlaneGame.prototype.ShowGameOver = function () {
	this.ctx.fillStyle = "white";
	this.ctx.font = "30px Arial";
	this.ctx.fillText("Click or Enter to Start", this.width/2 - 145, this.height/2);
	this.ctx.font = "20px Arial";
	this.ctx.fillText("ESC to End", this.width/2 - 55, this.height/2 + 30);
	this.ctx.font = "40px Arial";
	this.ctx.fillText("GAME OVER", this.width/2 - 125, this.height/2 - 50);
};

PlaneGame.prototype.ShowStartup = function () {
	if(this.loading >= 8) {//5 resources add 1
		this.DrawBackground();
		this.ctxbuf.font = "30px Arial";
		this.ctxbuf.fillStyle = "white";
		this.ctxbuf.fillText("Click to Start", this.width/2 - 90, this.height/2);
		this.ctxbuf.font = "20px Arial";
		this.ctxbuf.fillText("ESC to End", this.width/2 - 55, this.height/2 + 30);
		this.ctx.drawImage(this.cbuf, 0, 0);
		this.loaded = true;
	} else {
		if(this.loading === undefined)
			this.loading = 1;
		else
			this.loading++;
	}
};

PlaneGame.prototype.DrawBackground = function (ctx) {
	if(this.backgroundRoll === undefined)
		this.backgroundRoll = 0;
	if(this.backgroundRoll !== 0)
		this.ctxbuf.drawImage(this.resource.background, 0, this.resource.background.height - this.backgroundRoll, this.resource.background.width, this.backgroundRoll, 0, 0, this.width, this.backgroundRoll);
	this.ctxbuf.drawImage(this.resource.background, 0, 0, this.resource.background.width, this.resource.background.height - this.backgroundRoll, 0, this.backgroundRoll, this.width, this.resource.background.height - this.backgroundRoll);
	
	this.backgroundRoll++;
	if(this.backgroundRoll === this.resource.background.height)
		this.backgroundRoll = 0;
};

PlaneGame.prototype.MoveTo = function (x, y) {
	this.playerPlane.x = x;
	this.playerPlane.y = y;
};

PlaneGame.prototype.keydown = function (e) {
	var code;
	if(window.event)
		code = e.keyCode;
	else if(e.which)
		code = e.which;
	
	switch(code) {
	case 37://left
		this.keyState.west = 1;
		return false;
	case 38://up
		this.keyState.north = 1;
		return false;
	case 39://right
		this.keyState.east = 1;
		return false;
	case 40://down
		this.keyState.south = 1;
		return false;
	case 65://A
		this.keyState.fire = 1;
		return false;
	case 27://ESC
		this.Stop();
		return false;
	case 13://Enter
		if(this.startflag === false)
			this.Start();
		return false;
	}
	
	return true;
};

PlaneGame.prototype.keyup = function (e) {
	var code;
	if(window.event)
		code = e.keyCode;
	else if(e.which)
		code = e.which;
	
	switch(code) {
	case 37://left
		this.keyState.west = 0;
		return false;
	case 38://up
		this.keyState.north = 0;
		return false;
	case 39://right
		this.keyState.east = 0;
		return false;
	case 40://down
		this.keyState.south = 0;
		return false;
	case 65://A
		this.keyState.fire = 0;
		return false;
	}
	
	return true;
};

PlaneGame.prototype.Start = function () {
	if(this.loaded !== true) {
		alert("Game is still loading, please wait a second");
		return;
	}

	this.canvas.style.cursor = "none";
	this.init();
	
	this.startflag = true;
	this.stime = (new Date()).getTime() - 1000;
	this.count = 60;
	this.ctxbuf.font="20px Arial";
	
	this.MainLoop();
};

PlaneGame.prototype.Stop = function () {
	this.canvas.style.cursor = "default";

	this.startflag = false;
};

PlaneGame.prototype.mousedown = function (e) {
	this.keyState.mousefire = 1;
	
	if(this.startflag === false) {
		this.Start();
	}
};

PlaneGame.prototype.mouseup = function (e) {	
	this.keyState.mousefire = 0;
};

var pg = new PlaneGame("MainCanvas");

function OnKeyDown (e) {
	return pg.keydown(e);
}

function OnKeyUp (e) {
	return pg.keyup(e);
}

function OnMouseDown (e) {
	pg.mousedown();
	return false;
}

function OnMouseUp (e) {
	pg.mouseup();
	return false;
}

function OnMouseMove (e) {
	var x = e.clientX;
	var y = e.clientY;
	x -= pg.canvas.offsetLeft;
	y -= pg.canvas.offsetTop;
	if(pg.startflag) {//x > 0 - pg.playerPlane.width*2 && y > 0 - pg.playerPlane.height*2 && x < pg.width + pg.playerPlane.width*2 && y < pg.height + pg.playerPlane.height*2 && 
		var x2 = x;
		var y2 = y;
		var x1 = pg.playerPlane.x;
		var y1 = pg.playerPlane.y;
		
		var a = (y2 - y1)/Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		a = Math.acos(a);
		if(x1 < x2) {//right
			if(a <= Math.PI && a >= (7/8)*Math.PI) {//North
				pg.playerPlane.north();
				pg.playerPlane.go();
			} else if(a >= 0 && a <= (1/8)*Math.PI) {//South
				pg.playerPlane.south();
				pg.playerPlane.go();
			} else if(a >= (3/8)*Math.PI && a <= (5/8)*Math.PI) {//East or West
				pg.playerPlane.east();
				pg.playerPlane.go();
			} else if(a > Math.PI/2) {//North East or North West
				pg.playerPlane.northeast();
				pg.playerPlane.go();
			} else {//South East or South West
				pg.playerPlane.southeast();
				pg.playerPlane.go();
			}
		} else {//left
			if(a <= Math.PI && a >= (7/8)*Math.PI) {//North
				pg.playerPlane.north();
				pg.playerPlane.go();
			} else if(a >= 0 && a <= (1/8)*Math.PI) {//South
				pg.playerPlane.south();
				pg.playerPlane.go();
			} else if(a >= (3/8)*Math.PI && a <= (5/8)*Math.PI) {//East or West
				pg.playerPlane.west();
				pg.playerPlane.go();
			} else if(a > Math.PI/2) {//North East or North West
				pg.playerPlane.northwest();
				pg.playerPlane.go();
			} else {//South East or South West
				pg.playerPlane.southwest();
				pg.playerPlane.go();
			}
		}
		
		//if(pg.startflag)
		//	pg.MoveTo(x, y);
	}
}
