var CANVAS_WIDTH = $('.canvas_container').width();  //Canva setup!---//#0:uninfected, 1:infected, 2:locked, 3: immunized, 4: dead, 5: hospital#
var CANVAS_HEIGHT = $('body').height();  //var diff = document.documentElement.clientHeight - CANVAS_HEIGHT;
var canvas_1 = document.getElementById('canvas_1');
var ctx_1 = canvas_1.getContext('2d');
var canvas_2 = document.getElementById('canvas_2');
var ctx_2 = canvas_2.getContext('2d');
canvas_1.width = window.innerWidth;  //CANVAS_WIDTH;
canvas_1.height = window.innerHeight;  //CANVAS_HEIGHT;  
canvas_2.width = window.innerWidth;  //CANVAS_WIDTH;
canvas_2.height = window.innerHeight;  //CANVAS_HEIGHT;  

var gcounter = 0;  //Global variables setup!
var cl = CANVAS_WIDTH;
var interval, intervalActive;
var stateCount = { population: 0, fixedpopulation: 0, lockedpopulation: 0, infected: 0, immunized: 0, uninfected: 0, dead:0 };
var r=7;  //Radius
var touchesInAction = {};  //For mouse/touch event identification
var isDrawStart, startPosition, lineCoordinates;
var ms = 30;  //Other parameters and objects
var dt = ms / 1000;
var balls = [];
var sim;
var time = 0;
var velocit = {x: 0, y: 0};  //For newly created balls by click/mouse.
var max_velocit=5000; //Maxium velocity of newly created balls^|^
var elasticity=0.9;  //Co-efficient of restitution of collision!
///BEGIN:   Toy parameters for good UX!
var population=30;  //Total population 
var fixedpopulation=0;  //Initial fixed population (part of 'population')
var lockedpopulation=0;
var infected=5;
var immunized=0;
var dead=0;
var hospital_radius_factor=5;
var healtimer=5000;
var cointimer=50;
var housetimer=200;
var slowVal = 2;  //Slow the bounced off infected ball
var speed=247;
///END:   Toy parameters for good UX!
var stateProxy = new Proxy(stateCount, {
    set: function(target, key, value) {
        target[key] = value;
        var populatioN = document.getElementById("Total");
        populatioN.innerHTML = stateCount.population;
        var uninfecteD = document.getElementById("Uninfected");
        uninfecteD.innerHTML = stateCount.uninfected;
        var deaD = document.getElementById("Dead");
        deaD.innerHTML = stateCount.dead;
        var infecteD = document.getElementById("Infected");
        infecteD.innerHTML = stateCount.infected;
        return true;
    }
});

function MinPQ() { //Minimum Priority Queue
    this.heap = [null];
    this.n = 0;
    this.insert = function(key) {  //MinPQ API

        this.heap.push(key);
        this.swim(++this.n);
    };
    this.viewMin = function() {
        if (this.n < 1) {
            return null;
        }
        return this.heap[1];
    }
    this.delMin = function() {
        if (this.n < 1) {
            throw new Error('Called delMin() on empty MinPQ');
        }
        this.exch(1, this.n--);
        var deleted = this.heap.pop();
        this.sink(1);
        return deleted;
    };
    this.isEmpty = function() {
        return (this.n === 0);
    };
    this.swim = function(k) {
        var j = Math.floor(k / 2);
        while (j > 0 && this.less(k, j)) {
            this.exch(j, k);
            k = j;
            j = Math.floor(k / 2);
        }
    };
    this.sink = function(k) {
        var j = 2 * k;
        while (j <= this.n) {
            if (j < this.n && this.less(j + 1, j)) { j++; }
            if (this.less(k, j)) { break; }
            this.exch(j, k);
            k = j;
            j = 2 * k;
        }
    };
    this.less = function(i, j) {
        return this.heap[i].time < this.heap[j].time;
    };
    this.exch = function(i, j) {
        var swap = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = swap;
    };
}

function Ball(posX, posY, velX, velY, r, healtimer, cointimer, housetimer) {  //Ball constructor
    this.p = { x: posX, y: posY };
    this.v = { x: velX, y: velY };
    this.vold = { x: velX, y: velY };
    this.r = r;
    this.partner = null;
    var s = 0;  //#0:uninfected, 1:infected, 2:locked, 3: immunized, 4: dead, 5: hospital#
    var previous_s = 0;  //By default: uninfected (used for lockdown case)
    var previous_v = {x: velX, y: velY}; 
    var m = Math.PI * r * r;
    var vabs = 0;
    this.healtimer=healtimer;
    this.cointimer=cointimer;
    this.housetimer=housetimer;

    this.move = function(dt) {  //Basic move/draw
        this.p.x = this.p.x + this.v.x * dt;
        this.p.y = this.p.y + this.v.y * dt;
    };

    this.draw = function() {
    	if(this.r==6)
    		console.log(this.s,'iambad');
    	if(this.s==1){  //Saving an infected before death
    		this.healtimer-=1;
    		if(this.healtimer==0)
    		{
    			stateProxy.dead-=1;
    			this.s=4;
    			this.v.x=0;
    			this.v.y=0;
    			this.partner=null;
    		}
    	}
    	if(this.s==6){  //Coin collection before deadline
    		this.cointimer-=1;
    		if(this.cointimer==0){
    			this.s=3;
    			this.v.x=this.vold.x;
    			this.v.y=this.vold.y;
    			this.partner=null;
    		}
    	}
    	if(this.s==2)
    	{
    		this.v.x=0;
    		this.v.y=0;
    		this.partner=null;
    		this.housetimer-=1;
    		if(this.housetimer==0){
    			this.s=this.previous_s;
    			this.v.x=this.previous_v.x;
    			this.v.y=this.previous_v.y;
    		}
    	}

    	sim.predictAll(this);

        if (this.partner != null) {
            ctx_1.beginPath();
            ctx_1.moveTo(this.p.x, this.p.y);
            ctx_1.lineTo(this.partner.p.x, this.partner.p.y);
            ctx_1.lineWidth = 1;
            ctx_1.strokeStyle = "#a6a6a6";
            ctx_1.stroke();
        }

        ctx_1.beginPath();
        if (this.s == 5) {
            ctx_1.rect(this.p.x, this.p.y - this.r, this.r, this.r * 3)
            ctx_1.rect(this.p.x - this.r, this.p.y, this.r * 3, this.r)
        	ctx_2.arc(this.p.x,this.p.y,hospital_radius_factor*this.r,0,2*Math.PI);
        }
        else if(this.s==3){
		    ctx_1.beginPath();
 			ctx_1.arc(this.p.x,this.p.y,r,0,Math.PI, false);
      		ctx_1.closePath();
      		ctx_1.lineWidth = 1;
      		ctx_1.fillStyle = "#00CED1";  //Dark Turquoise bottom semicircle--immunized
      		ctx_1.fill();
      		ctx_1.strokeStyle = "#00CED1";
      		ctx_1.stroke();
	    	ctx_1.beginPath();
 			ctx_1.arc(this.p.x,this.p.y,r,Math.PI,2*Math.PI,false);
      		ctx_1.closePath();
		}
        else {
            ctx_1.arc(this.p.x, this.p.y, this.r, 0, 2 * Math.PI);
        }

        switch (this.s) {
            case 0:
                ctx_1.fillStyle = "#8c8c8c";  //Grey--uninfected
                break;
            case 1:
                ctx_1.fillStyle = "#ff4444";  //Red--infected
                break;
            case 2:
                ctx_1.fillStyle = "#ff00ff";  //Magenta--lockeddown                     --change to icon
                break;
            case 3:
                ctx_1.fillStyle =  "#8c8c8c";  //Grey top semicircle--immunized
                break;
            case 4:
                ctx_1.fillStyle = "#000000";  //Black  //"#798b47";  //"#ff4444";
                break;
            case 5:
            	ctx_1.fillStyle = "#00c851"  //Green
            	break;
        	case 6:
        		ctx_1.fillStyle = "#ffd700";  //Yellow
        }
        ctx_1.fill();
    };

    this.equals = function(ball) {  //Equality comparator
        return (
            this.p.x === ball.p.x &&
            this.p.y === ball.p.y &&
            this.v.x === ball.v.x &&
            this.v.y === ball.v.y &&
            this.r === ball.r
        );
    };

    this.timeToHit = function(ball){  //Collision prediction
        if (this.s == 5 || this.s == 4 || ball.s == 5 || ball.s == 4) { return Number.POSITIVE_INFINITY; }
        if (this.equals(ball)) { return Number.POSITIVE_INFINITY; }
        var dpx = ball.p.x - this.p.x;
        var dpy = ball.p.y - this.p.y;
        var dvx = ball.v.x - this.v.x;
        var dvy = ball.v.y - this.v.y;
        var dpdv = dvx * dpx + dvy * dpy;
        if (dpdv > 0) { return Number.POSITIVE_INFINITY; }
        var dvdv = dvx * dvx + dvy * dvy;
        var dpdp = dpx * dpx + dpy * dpy;
        var R = ball.r + this.r;
        var D = dpdv * dpdv - dvdv * (dpdp - R * R);
        if (D < 0) { return Number.POSITIVE_INFINITY; }
        return (-(dpdv + Math.sqrt(D)) / dvdv);
    };
    this.timeToHitVerticalWall = function() {
        if (this.v.x === 0) { return Number.POSITIVE_INFINITY; }
        if (this.v.x > 0) {
        	if(this.r==6)
        		console.log("varun1");
            return ((CANVAS_WIDTH - this.r - this.p.x) / this.v.x);
        }
        return ((this.r - this.p.x) / this.v.x);
    };
    this.timeToHitHorizontalWall = function() {
        if (this.v.y === 0) { return Number.POSITIVE_INFINITY; }
        if (this.v.y > 0) {
        	if(this.r==6)
        		console.log("varun2");
            
            return ((CANVAS_HEIGHT - this.r - this.p.y) / this.v.y);
        }
        return ((this.r - this.p.y) / this.v.y);
    };
    this.bounceOff = function(ball) {      //Collision resolution simplified (physically not correct!)
        //if (this.v.x != 0 || this.v.y != 0)
         {
            var min = 0;
            var max = this.vabs;
            var vx = Math.random() * (+max - +min) + +min;
            var vy = Math.sqrt(Math.pow(max, 2) - Math.pow(vx, 2));
            if(this.s==1){
            this.v.x = posNeg() * Math.floor(vx)/slowVal;
            this.v.y = posNeg() * Math.floor(vy)/slowVal;
            }
            else
            {
              this.v.x = posNeg() * Math.floor(vx);
              this.v.y = posNeg() * Math.floor(vy);
            }  //sim.predictAll(this);  //this.v.x = (this.v.x*(1-elasticity)+(1+elasticity)*ball.v.x)/2;--didn't work!
        }
        //if (ball.v.x != 0 || ball.v.y != 0) 
        {
            var min = 0;
            var max = ball.vabs;
            var vx = Math.random() * (+max - +min) + +min;
            var vy = Math.sqrt(Math.pow(max, 2) - Math.pow(vx, 2))
            if(ball.s==1){
            ball.v.x = posNeg() * Math.floor(vx)/slowVal;
            ball.v.y = posNeg() * Math.floor(vy)/slowVal;
            }
            else
            {
              ball.v.x = posNeg() * Math.floor(vx);
              ball.v.y = posNeg() * Math.floor(vy);
            }  //sim.predictAll(ball)
        }
        if (ball.s == 1){
        	if(this.s == 0){
        		this.s = 1;	
            	stateProxy.infected+=1;
            	stateProxy.uninfected-=1;
	            this.partner = ball;
    	        this.v.x = this.v.x/slowVal;
        	    this.v.y = this.v.y/slowVal;
            	sim.predictAll(this);
        		}
        	if(this.s == 3){
        		this.s = 0;
            	stateProxy.infected+=1;
            	stateProxy.uninfected-=1;
	            this.partner = ball;
    	        this.v.x = this.v.x/slowVal;
        	    this.v.y = this.v.y/slowVal;
            	sim.predictAll(this);
        		}
        	}
        if (this.s == 1){
        	if(ball.s==0){
        		ball.s = 1;
        		stateProxy.infected+=1;
            	stateProxy.uninfected-=1;
            	ball.partner = this;
            	ball.v.x = this.v.x/slowVal;
            	ball.v.y = this.v.y/slowVal;
            	sim.predictAll(ball);
       			}
       		if(ball.s==3){
       			ball.s = 0;
       			stateProxy.uninfected+=1;
	           	ball.v.x = this.v.x/slowVal;
            	ball.v.y = this.v.y/slowVal;
       			sim.predictAll(ball);
       		}
       	}
       	if(this.r==6 || ball.r==6)
       		console.log('raji1');
    };
    this.bounceOffVerticalWall = function() {
        this.v.x = -this.v.x;
    };
    this.bounceOffHorizontalWall = function() {
        this.v.y = -this.v.y;
    };
}

function SimEvent(time, a, b) {  //SimEvent constructor -- If FIRST is null => vertical wall collision!
    this.time = time;
    this.a = a;
    this.b = b;
    this.compareTo = function(simEvent) {
        return this.time - simEvent.time;
    };
    this.isValid = function(simTime) {
        // Note: toFixed(4) is used to avoid potential floating-point
        // accuracy errors
        var log = '';
        // Note: this check forces only one event at a given instant
        if (this.time < simTime) {
            log += 'Event precedes simulation time';
            console.log(log);
            return false;
        }
        if (a === null) { //vertical wall
            log += 'Validating vertical wall.\n';
            log += 'Event time: ' + this.time.toFixed(4) + ', Fresh time: ' + (simTime + b.timeToHitVerticalWall()).toFixed(4) + '\n'
                console.log(log);
            return this.time.toFixed(4) === (simTime + b.timeToHitVerticalWall()).toFixed(4);
        } else if (b === null) { //horizontal wall
            log += 'Validating vertical wall.\n';
            log += 'Event time: ' + this.time.toFixed(4) + ', Fresh time: ' + (simTime + a.timeToHitVerticalWall()).toFixed(4) + '\n';
            console.log(log);
            return this.time.toFixed(4) === (simTime + a.timeToHitHorizontalWall()).toFixed(4);
        } else { //particle-particle
        	if(a.r==6 || b.r==6)
        		console.log("mummm");
            log += 'Validating two-particle.\n';
            log += 'Event time: ' + this.time.toFixed(4) + ', Fresh time: ' + (simTime + a.timeToHit(b)).toFixed(4) + '\n';
            console.log(log);
            return this.time.toFixed(4) === (simTime + a.timeToHit(b)).toFixed(4);
        }
    };

    this.type = function() {
        if (a === null) { return 'vertical wall'; }
        if (b === null) { return 'horizontal wall'; }
        return 'ball';
    };
}

function Sim(balls) {  //Sim constructor
    if (balls == null) {
        throw new Error('Sim constructor requires array of balls');
    }
    for (var i = 0; i < balls.length; i++) {
        if (balls[i] == null) {
            throw new Error('Invalid ball passed to Sim constructor');
        }
    }

    this.time = 0;
    this.balls = balls;
    this.pq = new MinPQ();

    this.predictAll = function(ball) {
        if (ball == null) { return; }
        var dt;
        if(ball.r==6)
        	console.log("doing!!");

        for (var i = 0; i < balls.length; i++) {
            dt = ball.timeToHit(balls[i]);
                   	if(this.r==6)
       		console.log(dt);
            if (!isFinite(dt) || dt <= 0) { continue; }
                   	if(this.r==6)
       		console.log('raji2');
            this.pq.insert(new SimEvent(this.time + dt, ball, balls[i]));
        }
        dt = ball.timeToHitVerticalWall();
        if (isFinite(dt) && dt > 0) {
            this.pq.insert(new SimEvent(this.time + dt, null, ball));
        }
        dt = ball.timeToHitHorizontalWall();
        if (isFinite(dt) && dt > 0) {
            this.pq.insert(new SimEvent(this.time + dt, ball, null));
        }
    };

    this.predictBalls = function(ball) {
        if (ball == null) { return; }
        var dt;
        for (var i = 0; i < balls.length; i++) {
            dt = ball.timeToHit(balls[i]);
            if (!isFinite(dt) || dt <= 0) { continue; }
            this.pq.insert(new SimEvent(this.time + dt, ball, balls[i]));

        }
    };
    this.predictVerticalWall = function(ball) {
        if (ball == null) { return; }
        var dt = ball.timeToHitVerticalWall();
        if (isFinite(dt) && dt > 0) {
            this.pq.insert(new SimEvent(this.time + dt, null, ball));
        }
    };
    this.predictHorizontalWall = function(ball) {
        if (ball == null) { return; }
        var dt = ball.timeToHitHorizontalWall();
        if (isFinite(dt) && dt > 0) {
            this.pq.insert(new SimEvent(this.time + dt, ball, null));
        }
    };

    for (var i = 0; i < balls.length; i++) {
        this.predictAll(balls[i]);
    }

    this.redraw = function() {
        ctx_1.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (var i = 0; i < balls.length; i++) {
         if(balls[i].r==10)
         	console.log('hipp1');
         balls[i].draw();
        }
        gcounter += 1;
    };

    this.simulate = function(dt) {  //'Increment' the simulation by time dt
        var simLog = 'Start time: ' + this.time + '\n';
        var end = this.time + dt;
        var minEvent;
        var inc;

        var counter = 0;
        while (!this.pq.isEmpty()) {  //Check min event time. If outside time window, break. Otherwise, delete it. If not valid, continue. Otherwise, process the event.
            minEvent = this.pq.viewMin();
            if (minEvent.time >= end) {
                simLog += 'No events in time window (min time: ' + minEvent.time + ')';
                break;
            }
            this.pq.delMin();
            if (!minEvent.isValid(this.time)) {
                simLog += 'Invalid event: ' + minEvent.type() + '\n';
                continue;
            }

            simLog += 'Valid event: ' + minEvent.type() + '; ';
            inc = minEvent.time - this.time;
            for (var i = 0; i < balls.length; i++) {///
                balls[i].move(inc);
            }
            this.time = minEvent.time;

            var a = minEvent.a;
            var b = minEvent.b;
            if (a !== null && b !== null) {
                a.bounceOff(b);
                simLog += 'Bounced off particle\n';
                this.predictAll(a);
                this.predictAll(b);
            } else if (a === null && b !== null) {
                b.bounceOffVerticalWall();
                simLog += 'Bounced off vertical\n';
                this.predictBalls(b);
                this.predictVerticalWall(b);
            } else {
                a.bounceOffHorizontalWall();
                simLog += 'Bounced off horizontal\n';
                this.predictBalls(a);
                this.predictHorizontalWall(a);
            }
            counter++;/*
            if (counter > 5) {                            --Error MAX!
            	console.log(simLog);
            	throw new Error('Killed event process loop after ' + counter + ' executions!');
            }*/
        }
        inc = end - this.time;
        for (var i = 0; i < balls.length; i++) {///
            balls[i].move(inc);///
        }
        this.time = end;
        //console.log(simLog);
    };
}

function validateNewBall(balls, ball) {
    if (ball.p.x - ball.r <= 0 || ball.p.x + ball.r >= CANVAS_WIDTH ||
        ball.p.y - ball.r <= 0 || ball.p.y + ball.r >= CANVAS_HEIGHT) { return false; }
    var dx;
    var dy;
    var r;
    for (var i = 0; i < balls.length; i++) {
        dx = balls[i].p.x - ball.p.x;
        dy = balls[i].p.y - ball.p.y;
        r = balls[i].r + ball.r;
        if (dx * dx + dy * dy <= r * r) { return false; }
    }
    return true;
}

function posNeg() {
    return Math.pow(-1, Math.floor(Math.random() * 2));
}

function generateBalls(params) {
    var balls = [];
    var newBall;
    var badBallCounter = 0;
    var infectedCreated = 0;
    var fixedCreated = 0;
    var partFixed = Math.floor((params.populationFixed / params.n) * params.infected);
    var partMobile = params.infected - partFixed;
    for (var i = 0; i < params.n; i++) {
    var min = 0, vx, vy;
	var max = params.velocity;
	if(max.x!=undefined && max.y!=undefined)
	{vx = params.velocity.x; vy=params.velocity.y;}
	else
	{vx = Math.random() * (+max - +min) + +min; vy = Math.sqrt(Math.pow(params.velocity, 2) - Math.pow(vx, 2))}
    if (fixedCreated < params.populationFixed) {
        newBall = new Ball(
            Math.floor(Math.random() * CANVAS_WIDTH),
            Math.floor(Math.random() * CANVAS_HEIGHT),
            0,
            0,
            params.r,
			healtimer,  //params.healtimer..
			cointimer,
			housetimer
        );
        if (validateNewBall(balls, newBall)) {
            if (infectedCreated < partFixed) {
                infectedCreated++
                newBall.s = 1
            } else {
                newBall.s = 0
            }
            fixedCreated++
            newBall.vabs = 0
            balls.push(newBall);
            badBallCounter = 0;
        } else {
            if (++badBallCounter > 99) {
                console.log('Too many bad balls in random ball generator');
                return [];
            }
            i--;
        }
        }
    else {
        newBall = new Ball(
        Math.floor(Math.random() * CANVAS_WIDTH),
        Math.floor(Math.random() * CANVAS_HEIGHT),
        posNeg() * Math.floor(vx),
        posNeg() * Math.floor(vy),
        params.r,
		healtimer,
		cointimer,
		housetimer
        );
        if (validateNewBall(balls, newBall)) {
            if (infectedCreated < params.infected) {
                infectedCreated++
                newBall.s = 1
            } else {
                newBall.s = 0
            }
            newBall.vabs = max
            balls.push(newBall);
            badBallCounter = 0;
        } else {
        	if (++badBallCounter > 99) {
                console.log('Too many bad balls in random ball generator');
                return [];
            }
            i--;
            }
        }
    }
    return balls;
}

function makeSim(population,fixedpopulation,lockedpopulation,infected,immunized,dead)
{ 	stateProxy.population = population;
    stateProxy.fixedpopulation = fixedpopulation;
    stateProxy.lockedpopulation = lockedpopulation;
    stateProxy.infected = infected;
    stateProxy.immunized = immunized;
    stateProxy.uninfected = population - infected;
    stateProxy.immunized = immunized;
    stateProxy.dead = dead;

    balls = generateBalls({
        style: 'random',
        n: population,
        r: r,
        velocity: speed,
        infected: infected,
        populationFixed: fixedpopulation,
    });

    sim = new Sim(balls);
}

function activateInterval() {
    if (!intervalActive) {
        interval = window.setInterval(runSim, ms);
        intervalActive = true;
    }
}

function deactivateInterval() {
    window.clearInterval(interval);
    intervalActive = false;
}

function runSim() {
    sim.redraw();
    try {
        sim.simulate(dt);
    } catch (e) {
        console.log(e);
        window.clearInterval(interval);
    }
}

function arrow(ctx_internal,p1,p2,size)
{
	ctx_internal.save();
	console.log('rev',p1.x,p1.y,p2.x,p2.y);
	    ctx_internal.beginPath();
 		ctx_internal.arc(startPosition.x,startPosition.y,r,0,Math.PI, false);
      	ctx_internal.closePath();
      	ctx_internal.lineWidth = 1;
      	ctx_internal.fillStyle = "#00CED1";  //Dark Turquoise bottom semicircle--immunized
      	ctx_internal.fill();
      	ctx_internal.strokeStyle = "#00CED1";
      	ctx_internal.stroke();
	    ctx_internal.beginPath();
 		ctx_internal.arc(startPosition.x,startPosition.y,r,Math.PI,2*Math.PI,false);
      	ctx_internal.closePath();
		ctx_internal.fillStyle = "#8c8c8c";  //Grey!
        ctx_internal.fill();
    ctx_internal.fillStyle = ctx_internal.strokeStyle = '#099';
	ctx_internal.beginPath();
    var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy), theta=Math.atan2(dy,dx);
	var temp=parseFloat(len)/parseFloat(Math.sqrt(Math.pow(CANVAS_WIDTH,2)+Math.pow(CANVAS_HEIGHT,2)));
	velocit.x=temp*Math.cos(theta)*max_velocit;
	velocit.y=temp*Math.sin(theta)*max_velocit;
 	console.log("length",len,temp,theta,Math.cos(theta),Math.sin(theta));
	ctx_internal.translate(p2.x,p2.y);
	ctx_internal.rotate(Math.atan2(dy,dx));
      	ctx_internal.lineCap = 'round';
      	ctx_internal.beginPath();
      	ctx_internal.moveTo(0,0);
      	ctx_internal.lineTo(-len,0);
      	ctx_internal.closePath();
      	ctx_internal.stroke();
      	ctx_internal.beginPath();
      	ctx_internal.moveTo(0,0);
      	ctx_internal.lineTo(-size,-size);
      	ctx_internal.lineTo(-size, size);
     	ctx_internal.closePath();
     	ctx_internal.fill();
      	ctx_internal.restore(); 	
}

function clearCanvas(ctx_internal, canvas) {
   ctx_internal.clearRect(0, 0, canvas.width, canvas.height);
}

const getClientOffset = (event, canvas) => {
    const {pageX, pageY} = event.touches ? event.touches[0] : event;
    const x = pageX - canvas.offsetLeft;
    const y = pageY - canvas.offsetTop;
    return {x,y} 
}

function process_touchstart(event)
{
	event.preventDefault();
	var touches = getClientOffset(event, canvas_1);  //event.touches;changedTouches;
	if(touches!=undefined)
	{
	startPosition=touches;
	console.log('sg',startPosition.x,startPosition.y);
	velocit.x=0;velocit.y=0;
	    ctx_1.beginPath();
 		ctx_1.arc(startPosition.x,startPosition.y,r,0,Math.PI, false);
      	ctx_1.closePath();
      	ctx_1.lineWidth = 1;
      	ctx_1.fillStyle = "#00CED1";  //Dark Turquoise bottom semicircle--immunized
      	ctx_1.fill();
      	ctx_1.strokeStyle = "#00CED1";
      	ctx_1.stroke();
	    ctx_1.beginPath();
 		ctx_1.arc(startPosition.x,startPosition.y,r,Math.PI,2*Math.PI,false);
      	ctx_1.closePath();
		ctx_1.fillStyle = "#8c8c8c";  //Grey!
        ctx_1.fill();
	isDrawStart=true;
	}
}

function process_touchmove(event){
	event.preventDefault();
	var touches = getClientOffset(event, canvas_2);  //event.changedTouches;
	if(!isDrawStart) return;
		lineCoordinates=touches;
	if(lineCoordinates!=undefined && startPosition!=undefined)
	{
		clearCanvas(ctx_2, canvas_2);
		arrow(ctx_2,startPosition,lineCoordinates,10);
	}
}

function process_touchend(event) {
	event.preventDefault();
	var touches = getClientOffset(event, canvas_1);  //event.changedTouches;
	if(touches!=undefined)
	{
		console.log("hippy:",velocit.x,velocit.y);
		var newBall = new Ball(
	                startPosition.x,
	                startPosition.y,
	                velocit.x,
	                velocit.y,
	                r,
	           		healtimer,
					cointimer,
					housetimer
	            );
		newBall.vabs = Math.sqrt(Math.pow(velocit.x,2)+Math.pow(velocit.y,2));
		newBall.s=3;
	if(validateNewBall(newBall, newBall)){
		balls.unshift(newBall);  //push()
		console.log('shw');
	}	clearCanvas(ctx_2, canvas_2);	
		isDrawStart=false;
	}	
}

//function init() { if (ctx_1 && ctx_2) {  //--Called with '<body onload="init()">'
canvas_1.addEventListener('mousedown', process_touchstart,false);
canvas_1.addEventListener('mousemove', process_touchmove,false);
//canvas_1.addEventListener('touchcancel', process_touchcancel, false);
canvas_1.addEventListener('mouseup', process_touchend,false);
canvas_1.addEventListener('touchstart', process_touchstart,false);
canvas_1.addEventListener('touchmove', process_touchmove,false);
//canvas_1.addEventListener('touchcancel', process_touchcancel, false);
canvas_1.addEventListener('touchend', process_touchend,false);

canvas_2.addEventListener('mousedown', process_touchstart,false);
canvas_2.addEventListener('mousemove', process_touchmove,false);
//canvas_2.addEventListener('touchcancel', process_touchcancel, false);
canvas_2.addEventListener('mouseup', process_touchend,false);
canvas_2.addEventListener('touchstart', process_touchstart,false);
canvas_2.addEventListener('touchmove', process_touchmove,false);
//canvas_2.addEventListener('touchcancel', process_touchcancel, false);
canvas_2.addEventListener('touchend', process_touchend,false);

makeSim(population,fixedpopulation,lockedpopulation,infected,immunized,dead);
sim.redraw();
$('#stop').on('click', deactivateInterval);
$('#new').on('click', function() {
    deactivateInterval();
    makeSim(population,fixedpopulation,lockedpopulation,infected,immunized,dead);
    activateInterval();
    sim.redraw();
});