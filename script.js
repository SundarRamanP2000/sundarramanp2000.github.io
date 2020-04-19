//#0:uninfected, 1:infected, 2:locked, 3: immunized, 4: dead, 5: hospital, 6:healed#//
var hospital_on=0;  //Global variables setup!
var house_on=0;
var flag=0;  //Used for locating hospital, lock or masked?
var plause=0;
var canvas_1;  //Canva setup!
var ctx_1;
var canvas_2;
var ctx_2;
var CANVAS_WIDTH, CANVAS_HEIGHT;
var gcounter = 0;  
var cl = CANVAS_WIDTH;
var interval, intervalActive;
var stateCount = { population: 0, fixedpopulation: 0, lockedpopulation: 0, infected: 0, immunized: 0, uninfected: 0, dead:0, coins_hospi: 0, score: 0, saved: 0, vaccines: 0};
var r=5;  //Radius
var global_r=5;
var touchesInAction = {};  //For mouse/touch event identification
var isDrawStart, startPosition, lineCoordinates;
var ms = 30;  //Other parameters and objects
var dt = ms / 1000;
var balls = [];
var hospitals = [];
var sim;
var time = 0;
var velocit = {x: 0, y: 0};  //For newly created balls by click/mouse.
var max_velocit=5000; //Maxium velocity of newly created balls^|^
var elasticity=0.9;  //Co-efficient of restitution of collision!
///BEGIN:   Toy parameters for good UX!
var population=8;  //Total population 
var fixedpopulation=0;  //Initial fixed population (part of 'population')
var lockedpopulation=0;
var infected=3;
var immunized=0;
var dead=0;
var hospital_radius_factor=10;
var healtimer=800;//800;
var housetimer=200;
var hospitaltimer=100;  //300
var slowVal = 1.5;  //Slow the bounced off infected ball
var slowVal_hospi = 1.5;  //Slow balls which enter hospital
var speed=177;  //247
var crem=40;  //Time after death!
var min_touch=8000;  //Empirical obsv.
var immunized_initial_speed_x=100;  //Initial speed of immunized in x direction!
var immunized_initial_speed_y=100;  //Initial speed of immunized in y direction!
///END:   Toy parameters for good UX!
var elem = document.documentElement;
var first_time=1;
var olympic_radius=50;
var gimmick=800;
var level_switcher=550;
var stage=0;
var set=0, gimmick2=0, extra=0, extra2=0;
var stateProxy = new Proxy(stateCount,  {
    set: function(target, key, value)  {
        target[key] = value;
        return true;
    }
});

function restart(){
    deactivateInterval();
    ctx_1.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx_1.fillStyle = 'rgba(0,0,0,1)';
    ctx_1.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	first_time=1;
	document.getElementById('pause_id').click();
	document.getElementById("gameover").style.display = "none";
	gimmick=800;
	stage=0;
	population=10;
	fixedpopulation=0;
	lockedpopulation=0;
	infected=3;
	stateProxy.dead=0;
	stateProxy.score=0;
	stateProxy.saved=0;
	speed=247;
	stateProxy.coins_hospi=0;
	stateProxy.vaccines=0;
	set=0; extra=0; gimmick2=0; extra2=0;
	document.getElementById("b1_1").style.color="black";
	document.getElementById("b2_1").style.color="black";
	document.getElementById('instr2').style.display = 'inline-block';
	document.getElementById('instr3').style.display = 'inline-block';
}
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
function hospitalOn(){
	house_on=0;
	hospital_on=1;
	document.getElementById("b1_1").style.color="white";
	document.getElementById("b2_1").style.color="black";
}
function houseOn(){
	hospital_on=0;
	house_on=1;
	document.getElementById("b2_1").style.color="white";
	document.getElementById("b1_1").style.color="black";
}
$(document).ready(
$("#pause_id").click(function pause(){
        var pause_button = document.getElementById("pause_id");
        if(pause_button!=null){
        pause_button.id="play_id";
        pause_button.onclick="play()";
        ($(document.getElementById("pause_id")).removeClass("fa fa-pause").addClass("fa fa-play"));//="fa fa-pause";  //.class="fa fa-play";  
}}));
$(document).ready(
$("#play_id").click(function play(){// console.log('2',plause);
        if(plause==0){
        	if(first_time==1){
    			document.getElementById('instr2').style.display = 'none';
				document.getElementById('instr3').style.display = 'none';
        		first_time=0;
        		hospital_on=0;
        		house_on=0;
			   	hospitals=[];balls=[];
				canvas_1 = document.getElementById('canvas_1');  //Canva setup!
				ctx_1 = canvas_1.getContext('2d');
				canvas_2 = document.getElementById('canvas_2');
				ctx_2 = canvas_2.getContext('2d');
				canvas_3 = document.getElementById('canvas_3');
				ctx_3 = canvas_3.getContext('2d');
				CANVAS_WIDTH = canvas_1.offsetWidth;
				CANVAS_HEIGHT = canvas_1.offsetHeight;
				canvas_1.width = canvas_1.offsetWidth;//CANVAS_WIDTH;  //window.innerWidth();  //CANVAS_WIDTH;
				canvas_1.height = canvas_1.offsetHeight;//CANVAS_HEIGHT;  //CANVAS_HEIGHT;  //window.innerHeight();  
				canvas_2.width = canvas_1.offsetWidth;//CANVAS_WIDTH;  //window.innerWidth;  //CANVAS_WIDTH;
				canvas_2.height = canvas_1.offsetHeight;//CANVAS_HEIGHT;  //window.innerHeight;  //CANVAS_HEIGHT;  
       			canvas_3.width = canvas_3.offsetWidth;
       			canvas_3.height = canvas_3.offsetHeight;
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
				canvas_3.addEventListener('mousedown', process_touchstart,false);
				canvas_3.addEventListener('mousemove', process_touchmove,false);
				//canvas_3.addEventListener('touchcancel', process_touchcancel, false);
				canvas_3.addEventListener('mouseup', process_touchend,false);
				canvas_3.addEventListener('touchstart', process_touchstart,false);
				canvas_3.addEventListener('touchmove', process_touchmove,false);
				//canvas_3.addEventListener('touchcancel', process_touchcancel, false);
				canvas_3.addEventListener('touchend', process_touchend,false);
        		console.log(CANVAS_HEIGHT,CANVAS_WIDTH);
      			makeSim(population,fixedpopulation,lockedpopulation,infected);
        		stateProxy.vaccines=parseInt(infected/2);
    			activateInterval();
    			sim.redraw();
       	}
       		else  {
	   			activateInterval();
    			sim.redraw();
	    		}
        var play_button = document.getElementById("play_id");
        play_button.id="pause_id";
        play_button.onclick="pause()";
        ($(document.getElementById("play_i")).removeClass("fa-play").addClass("fa-pause"));//="fa fa-pause";  //.class="fa fa-play";  
        document.getElementById("play_i").id="pause_i";
        plause=1;
    	}
    	else{
    	plause=0;
        deactivateInterval();
        var pause_button = document.getElementById("pause_id");
        pause_button.id="play_id";
        pause_button.onclick="play()";
        ($(document.getElementById("pause_i")).removeClass("fa-pause").addClass("fa-play"));//="fa fa-pause";  //.class="fa fa-play";  
        document.getElementById("pause_i").id="play_i";
		}
        	}
));
function openFullscreen(){
	document.getElementById('button').style.display = 'none';
	document.getElementById('instr1').style.display = 'none';
	document.getElementById('instr5').style.display = 'none';
	document.getElementById('instr2').style.display = 'inline-block';
	document.getElementById('instr3').style.display = 'inline-block';
  if (elem.requestFullscreen) {
    elem.requestFullscreen(); screen.orientation.lock("landscape-secondary"); document.getElementById("canvas").style.display="block";
  } 
  if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen(); ScreenOrientation.lock("landscape-secondary"); document.getElementById("canvas").style.display="block";
  } 
   if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen(); screen.orientation.lock("landscape-secondary"); document.getElementById("canvas").style.display="block";
  } 
   if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen(); ScreenOrientation.lock("landscape-secondary"); document.getElementById("canvas").style.display="block";
}}
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
function scorer()  {/* 
	ctx_1.beginPath();
	ctx_1.arc(15,15,r,0,2*Math.PI, false);
	ctx_1.closePath();
	ctx_1.fillStyle = "#00CED1";  //"#00C851";  //Green circle--immunized
	ctx_1.fillText(stateProxy.vaccines,25,20);
	ctx_1.fill();*/
	ctx_1.beginPath();
	ctx_1.arc(15,15,r,0,2*Math.PI, false);
	ctx_1.closePath();
	ctx_1.fillStyle = "#ffffff";  //"#00C851";  //Green circle--immunized
	ctx_1.fillText(stateProxy.dead,25,20);
	ctx_1.fill();
/*
	ctx_1.font='12px serif';  //DEAD
	ctx_1.fillStyle='rgba(255,255,255,1)';
	ctx_1.fillText(String.fromCodePoint(0x1F47B)+' '+stateProxy.dead,15,15);  //👻
	ctx_1.fillStyle='rgba(255,0,0,1)';  //INFECTED
	ctx_1.fillText(String.fromCodePoint(0x1F912)+' '+stateProxy.infected,15,35);  //🤒
	ctx_1.fillStyle='#ffd700';  //COINS
	ctx_1.fillText(stateProxy.coins+' '+String.fromCodePoint(0x1F4B0),CANVAS_WIDTH-50,15);  //💰
	ctx_1.fillStyle='#00CED1';  //MASED
	ctx_1.fillText(stateProxy.immunized+' '+String.fromCodePoint(0x1F637),CANVAS_WIDTH-50,35);  //😷*/

}
function Ball(posX, posY, velX, velY, r, healtimer, housetimer, hospitaltimer, crem) {  //Ball constructor
    this.p = { x: posX, y: posY };
    this.v = { x: velX, y: velY };
    this.vold = { x: velX, y: velY };
    this.r = r;
    this.partner = null;
    var s = 0;  //#0:uninfected, 1:infected, 2:locked, 3: immunized, 4: dead, 5: hospital#
    var previous_s = 0;  //By default: uninfected (used for lockdown case)
    var previous_v = {x: 0, y: 0}; 
    var m = Math.PI * r * r;
    var vabs = 0;
    this.healtimer=healtimer;
    this.housetimer=housetimer;
    this.hospitaltimer=hospitaltimer;
    this.inside_hospital=0;
    this.crem=crem;
    this.move = function(dt) {  //Basic move/draw
        this.p.x = this.p.x + this.v.x * dt;
        this.p.y = this.p.y + this.v.y * dt;
    };
    this.draw = function() {
    	console.log('lk',stateProxy.saved,stateProxy.infected, set, extra);
    	if(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && screen.orientation.type!="landscape-secondary"){
    			console.log("Reloading as screen orientation is changed!");
    			location.reload(true);
    			exit();
    		}
    	if(stateProxy.saved!=0 && stateProxy.saved%5==0 && set==0 && extra==0 && extra2==0){
    		set=1;
    		extra=1;extra2=1;
  			document.getElementById("openModal").style.display = 'flex';
    		document.getElementById('stage').style.color = "#003cff";
    		document.getElementById('stage').innerHTML = '+5 saved!';
    		gimmick2=1000;
    	}
    	if(stateProxy.saved!=1 && stateProxy.saved%5-1==0 && extra2==1) extra2=0;
    	if(gimmick2>0){
    		gimmick2-=1;
    		if(gimmick2==0){
   	    		document.getElementById('stage').style.color = 'white'; 
 		   		document.getElementById("openModal").style.display = 'none';		   		
    		}
    	}
    	if(stateProxy.infected==0 && flag!=1){
    		level_switcher-=1;
    		if(level_switcher==0){
    			level_switcher=550;
    			balls=[];
    			hospitals=[];
    			gimmick=800;
    			speed+=35;
   				population+=2;
   				infected+=1;set=0;extra=0;extra2=0;
      			makeSim(population,fixedpopulation,lockedpopulation,infected);
        		stateProxy.vaccines=parseInt(infected/2);		
    			activateInterval();
    			sim.redraw();
    			}	
    	}
    	scorer();
		document.getElementById('n_h').innerHTML = '*'+ parseInt(stateProxy.coins_hospi/5);
		document.getElementById('n_l').innerHTML = stateProxy.vaccines+'*';
		if(set>0){
			document.getElementById('n_l').style.color = "#003cff";
			document.getElementById('b2').style.backgroundColor = "#003cff";
		}
		else{
			document.getElementById('n_l').style.color = "#00CED1"; 
			document.getElementById('b2').style.backgroundColor = "#00CED1"; 
		}
    	stateProxy.score = stateProxy.saved - stateProxy.dead;
		if(gimmick>=0 && flag!=1)  {
    		gimmick-=1;
			    document.getElementById("stage").innerHTML = "STAGE "+ stage;
	   			document.getElementById("openModal").style.display = 'flex';
		    	ctx_1.font = '25px serif';
		   		//ctx_1.fillText('🏠',CANVAS_WIDTH/2-3,CANVAS_HEIGHT/2-3);
		   		if(gimmick==0)  {
		   			document.getElementById("openModal").style.display = 'none';
					stage++;
		   			var temp_v_x=speed*posNeg()*Math.random();
					var temp_v_y=speed*posNeg()*Math.random()
					var newBall = new Ball(
	                	CANVAS_WIDTH/2,
	                	CANVAS_HEIGHT/2,
	                	temp_v_x,
	                	temp_v_y,
	                	1.75*global_r,
	           			healtimer,
						housetimer,
						hospitaltimer,
						crem
	            		);
					newBall.vabs = Math.sqrt(Math.pow(temp_v_x,2)+Math.pow(temp_v_y,2));
					newBall.s=0;--gimmick;
					balls.unshift(newBall);  //push()
			    	}
		}
    	if(this.s==1 && flag!=1) {  //Saving an infected before death
    		this.healtimer-=1;
    		if(this.healtimer==0)
    		{
    			stateProxy.dead+=1;
    			stateProxy.infected-=1;
    			this.s=4;
    			this.v.x=0;
    			this.v.y=0;
    		}
    	}
    	if(this.s==2 && flag!=1) {  //House destroyed after some time restoring previous values
    		this.v.x=0;
    		this.v.y=0;
    		if(this.previous_s==1)
	       		this.healtimer-=1;
    	}
    	if(this.s==4 && flag!=1)
    		this.crem-=1;
    	if(this.s==5 && flag!=1)
    		this.hospitaltimer-=1;
    	sim.predictAll(this);/*
        if (this.partner != null) {
            ctx_1.beginPath();
            ctx_1.moveTo(this.p.x, this.p.y);
            ctx_1.lineTo(this.partner.p.x, this.partner.p.y);
            ctx_1.lineWidth = 1;
            ctx_1.strokeStyle = "#a6a6a6";
            ctx_1.stroke();
        }*/
        ctx_1.beginPath();
        if (this.s == 5)  {
        	if(this.hospitaltimer<10 && flag!=1) { 
         		if(this.hospitaltimer%4==0) {
        	var temp_r = parseFloat(this.r)/parseFloat(hospital_radius_factor);
            ctx_1.rect(this.p.x, this.p.y - temp_r, temp_r, temp_r * 3);
            ctx_1.rect(this.p.x - temp_r, this.p.y, temp_r * 3, temp_r);
            ctx_1.fillStyle = "#00c851";  //"#013220";  //'rgba(0,255,0,1)';  //"#00c851"  //Green
            ctx_1.fill();/*
        	ctx_1.font = '30px serif';     
           	ctx_1.fillText('🏥',this.p.x,this.p.y);*/
	       	ctx_1.arc(this.p.x,this.p.y,this.r,0,2*Math.PI);
        	ctx_1.arc(this.p.x,this.p.y,this.r,0,2*Math.PI);
        	ctx_1.fillStyle = 'rgba(155,229,170,0.3)';
        	ctx_1.fill();
	   		if(this.hospitaltimer==0)  {
	   			balls.splice(balls.indexOf(this),1);
        		hospitals.splice(balls.indexOf(this),1);
        	}
    			}

        	}
        	else {
        	var temp_r = parseFloat(this.r)/parseFloat(hospital_radius_factor);
            ctx_1.rect(this.p.x-parseFloat(temp_r)/parseFloat(2), this.p.y - parseFloat(3*temp_r)/parseFloat(2), temp_r, temp_r * 3);
            ctx_1.rect(this.p.x - parseFloat(3*temp_r)/parseFloat(2), this.p.y-parseFloat(temp_r)/parseFloat(2), temp_r * 3, temp_r);
            ctx_1.fillStyle = "#00c851";  //'rgba(0,255,0,1)';  //"#00c851"  //Green
            ctx_1.fill();/*
           	ctx_1.font = '30px serif';     
           	ctx_1.fillText('🏥',this.p.x,this.p.y);*/
        	ctx_1.arc(this.p.x,this.p.y,this.r,0,2*Math.PI);
        	ctx_1.fillStyle = 'rgba(155,229,170,0.3)';
        	ctx_1.fill();
        	}
        }
        else if(this.s==3)  {
		    ctx_1.beginPath();
	 		ctx_1.arc(this.p.x,this.p.y,r,0,2*Math.PI, false);
	      	ctx_1.closePath();
	      	if(this.r!=global_r)
	      		ctx_1.fillStyle = "#003cff";
	      	else
		      	ctx_1.fillStyle = "#00CED1";  //"#00C851";  //Green circle--immunized
	      	ctx_1.fill();
		}
		else if (this.s==4)  {
		    if(this.crem<20 && flag!=1) { 
       		if(this.crem%4!=0) {
		        ctx_1.arc(this.p.x, this.p.y, this.r, 0, 2 * Math.PI);
		        ctx_1.fillStyle = "#ffffff";  //Black  //"#798b47";  //"#ff4444";
            	ctx_1.fill();
	   			if(this.r!=global_r){
	   				document.getElementById("gameover").style.display = "flex";
	   				document.getElementById("gameover2").innerHTML = "SCORE: "+stateProxy.score;
	   				deactivateInterval();
        	}}/*
        	else  {
        	ctx_1.font = '30px serif';
        	ctx_1.fillText('👻',this.p.x-4,this.p.y-3);  //ballpark!
        	}*/
        	if(this.crem==0)
	   			balls.splice(balls.indexOf(this),1);	
   	   		}
        else {
		        ctx_1.arc(this.p.x, this.p.y, this.r, 0, 2 * Math.PI);
		        ctx_1.fillStyle = "#ffffff";  //'rgba(0,255,0,1)';  //"#00c851"  //Green
            	ctx_1.fill();
        	}
 		}
 		else if (this.s==2)  {
 			var temp_rad=this.r/2;
        	if(this.previous_s==3){
		    ctx_1.beginPath();
	 		ctx_1.arc(this.p.x,this.p.y,r,0,2*Math.PI, false);
	      	ctx_1.closePath();
	      	ctx_1.fillStyle = "#00CED1";  //"#00C851";  //Green circle--immunized
	      	ctx_1.fill();
        	}
        	else if(this.previous_s==1){
            ctx_1.arc(this.p.x, this.p.y,temp_rad, 0, 2 * Math.PI);//ctx_1.fillStyle = 'rgba(255,0,0,1-parseFloat(this.healtimer)/parseFloat(healtimer))';
           	var brightness = Math.ceil(10*(parseFloat(this.healtimer)/parseFloat(healtimer)));
            switch(brightness){
                	case 0:  ctx_1.fillStyle = 'rgba(255,0,0,0.3)';  break;
                	case 1:  ctx_1.fillStyle = 'rgba(255,0,0,0.4)';  break;
                	case 2:  ctx_1.fillStyle = 'rgba(255,0,0,0.45)';  break;
                	case 3:  ctx_1.fillStyle = 'rgba(255,0,0,0.55)';  break;
					case 4:  ctx_1.fillStyle = 'rgba(255,0,0,0.65)';  break;
					case 5:  ctx_1.fillStyle = 'rgba(255,0,0,0.75)';  break;
					case 6:  ctx_1.fillStyle = 'rgba(255,0,0,0.8)';  break;
					case 7:  ctx_1.fillStyle = 'rgba(255,0,0,0.85)';  break;
					case 8:  ctx_1.fillStyle = 'rgba(255,0,0,0.9)';  break;
					case 9:  ctx_1.fillStyle = 'rgba(255,0,0,0.95)';  break;
					case 10:  ctx_1.fillStyle = 'rgba(255,0,0,1)';  break;
            }
            ctx_1.fill();
    		if(this.healtimer==0)
    		{
    			stateProxy.dead+=1;
    			stateProxy.infected-=1;
    			this.s=4;
    			this.r/=2;
    			this.v.x=0;
    			this.v.y=0;
    			this.partner=null;
    		}
        	}
        	else if(this.previous_s==0){
            ctx_1.arc(this.p.x, this.p.y,temp_rad, 0, 2 * Math.PI);
            ctx_1.fillStyle = '#8c8c8c';
            ctx_1.fill();     		
        	}
        	else if(this.previous_s==6){
            ctx_1.arc(this.p.x, this.p.y,temp_rad, 0, 2 * Math.PI);
            ctx_1.fillStyle = '#00C851';
            ctx_1.fill();     		
        	}
        	ctx_1.beginPath();
        	ctx_1.arc(this.p.x,this.p.y,this.r,0,Math.PI*2);
        	ctx_1.closePath();
      		ctx_1.lineWidth = 2;
     	  	ctx_1.strokeStyle = '#003cff';  //'rgba(0,0,128,1)';
        	ctx_1.stroke();
        }
        else if(this.s==7)
			balls.splice(balls.indexOf(this),1);        	
        else
           ctx_1.arc(this.p.x, this.p.y, this.r, 0, 2 * Math.PI);
		switch (this.s) {
            case 0:
    			if(this.r==8.75)  {
    				ctx_1.fillStyle = "#ffffff";
					ctx_1.font='12px serif';
            		ctx_1.fillText('SCORE: '+stateProxy.score,CANVAS_WIDTH/2-35,15);
    			}
	            ctx_1.fillStyle = "#8c8c8c";  //Grey--uninfected
				ctx_1.fill();
                break;
            case 1:
            	var brightness = Math.ceil(10*(parseFloat(this.healtimer)/parseFloat(healtimer)));
                switch(brightness){
                	case 0:  ctx_1.fillStyle = 'rgba(255,0,0,0.3)';  break;
                	case 1:  ctx_1.fillStyle = 'rgba(255,0,0,0.4)';  break;
                	case 2:  ctx_1.fillStyle = 'rgba(255,0,0,0.45)';  break;
                	case 3:  ctx_1.fillStyle = 'rgba(255,0,0,0.55)';  break;
					case 4:  ctx_1.fillStyle = 'rgba(255,0,0,0.65)';  break;
					case 5:  ctx_1.fillStyle = 'rgba(255,0,0,0.75)';  break;
					case 6:  ctx_1.fillStyle = 'rgba(255,0,0,0.8)';  break;
					case 7:  ctx_1.fillStyle = 'rgba(255,0,0,0.85)';  break;
					case 8:  ctx_1.fillStyle = 'rgba(255,0,0,0.9)';  break;
					case 9:  ctx_1.fillStyle = 'rgba(255,0,0,0.95)';  break;
				    case 10:  ctx_1.fillStyle = 'rgba(255,0,0,1)';  break;
                }
                if(this.r==8.75)  {
	    			ctx_1.font='12px serif';
       				ctx_1.fillText('SCORE: '+stateProxy.score,CANVAS_WIDTH/2-35,15);
       			}
		        ctx_1.fill();  //,1-parseFloat(this.healtimer)/parseFloat(healtimer))';ctx_1.fill();//"#8D0000";  //"#ff4444";  //Red--infected
                break;
/*            case 3:
                ctx_1.fillStyle =  "#8c8c8c";ctx_1.fill();  //Grey top semicircle--immunized
                break;*/
        	case 6:
        		ctx_1.fillStyle = "#00C851"; ctx_1.fill(); break; //Yellow (gold for coins)--"#ffd700";
        	}
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
        if (this.s == 4 || ball.s == 4 || this.s==5 || ball.s==5)  { return Number.POSITIVE_INFINITY; }
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
            return ((CANVAS_WIDTH - this.r - this.p.x) / this.v.x);
        }
        return ((this.r - this.p.x) / this.v.x);
    };
    this.timeToHitHorizontalWall = function() {
        if (this.v.y === 0) { return Number.POSITIVE_INFINITY; }
        if (this.v.y > 0) {
            return ((CANVAS_HEIGHT - this.r - this.p.y) / this.v.y);
        }
        return ((this.r - this.p.y) / this.v.y);
    };
    this.bounceOff = function(ball) {      //Collision resolution simplified (physically not correct!)
        if(this.s!=5 && ball.s!=5)  //if (this.v.x != 0 || this.v.y != 0)
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
		if(ball.s!=5 && this.s!=5)  //if (ball.v.x != 0 || ball.v.y != 0) 
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
        		this.healtimer=healtimer;	
            	stateProxy.uninfected-=1;
    	        this.v.x = this.v.x/slowVal;
        	    this.v.y = this.v.y/slowVal;
            	sim.predictAll(this);
            	sim.predictAll(ball);
        		}
        	if(this.s == 3){
        		this.s=7;
   				ball.s = 0;
        		stateProxy.saved+=1;
            	stateProxy.infected-=1;
           		stateProxy.coins_hospi+=1;
           		stateProxy.vaccines+=1;
           		if(this.r!=global_r){
           			if(ball.r==global_r){
           			ball.previous_v=ball.v;
					ball.previous_s=ball.s;
					ball.v.x=0;
					ball.v.y=0;
					ball.s=2;
					ball.r*=2;}
					if(extra>0) --extra;
        		}
          	sim.predictAll(ball);
        	}
        }	
        else if (this.s == 1){
        	if(ball.s==0){
        		ball.s = 1;
       			ball.healtimer=healtimer;
        		stateProxy.infected+=1;
            	stateProxy.uninfected-=1;
            	ball.v.x = this.v.x/slowVal;
            	ball.v.y = this.v.y/slowVal;
            	sim.predictAll(ball);
            	sim.predictAll(this);
       			}
       		if(ball.s==3){
       			ball.s=7;
  				this.s=0;
       			stateProxy.infected-=1;
       			stateProxy.saved+=1;
       			stateProxy.uninfected+=1;
       			stateProxy.coins_hospi+=1;
       			stateProxy.vaccines+=1;
	   		if(ball.r!=global_r){
	   			if(this.r==global_r){
           			this.previous_v=this.v;
					this.previous_s=this.s;
					this.v.x=0;
					this.v.y=0;
					this.s=2;
					this.r*=2;}
					if(extra>0) --extra;
        		}       			
       			sim.predictAll(this);
       		}
       	}
       	else if((this.s==0 || this.s==6) && ball.s==3){
	   			ball.s=7;
       			stateProxy.vaccines+=1;
   	       		if(ball.r!=global_r){
   	       		if(this.r==global_r){
           			this.previous_v=this.v;
					this.previous_s=this.s;
					this.v.x=0;
					this.v.y=0;
					this.s=2;
					this.r*=2;}
					if(extra>0) --extra;
        		}
       			sim.predictAll(this);
       	}
       	else if((ball.s==0 || ball.s==6) && this.s==3){
       			this.s=7;
       			stateProxy.vaccines+=1;
    			if(this.r!=global_r){
    			if(ball.r==global_r){
           			ball.previous_v=ball.v;
					ball.previous_s=ball.s;
					ball.v.x=0;
					ball.v.y=0;
					ball.s=2;
					ball.r*=2;}
					if(extra>0) --extra;
        		}       					
       			sim.predictAll(ball);
       	}       	
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
            return false;
        }
        if (a === null) { //vertical wall
            log += 'Validating vertical wall.\n';
            log += 'Event time: ' + this.time.toFixed(4) + ', Fresh time: ' + (simTime + b.timeToHitVerticalWall()).toFixed(4) + '\n'
            //   console.log(log);
            return this.time.toFixed(4) === (simTime + b.timeToHitVerticalWall()).toFixed(4);
        } else if (b === null) { //horizontal wall
            log += 'Validating vertical wall.\n';
            log += 'Event time: ' + this.time.toFixed(4) + ', Fresh time: ' + (simTime + a.timeToHitVerticalWall()).toFixed(4) + '\n';
            //   console.log(log);
            return this.time.toFixed(4) === (simTime + a.timeToHitHorizontalWall()).toFixed(4);
        } else { //particle-particle
            log += 'Validating two-particle.\n';
            log += 'Event time: ' + this.time.toFixed(4) + ', Fresh time: ' + (simTime + a.timeToHit(b)).toFixed(4) + '\n';
            //    console.log(log);
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
    this.predictAll = function(ball){
        if (ball == null) { return; }
        var dt;
        for (var i = 0; i < balls.length; i++) {
            dt = ball.timeToHit(balls[i]);
            if (!isFinite(dt) || dt <= 0) { continue; }
            this.pq.insert(new SimEvent(this.time + dt, ball, balls[i]));
        }
        dt = ball.timeToHitVerticalWall()	;
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
		ctx_1.fillStyle = 'rgba(0,0,0,1)';
        ctx_1.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if(hospitals.length!=0)  {  //undefined
        	for(var j=0; j < hospitals.length; j++){
        		for(var i=0; i < balls.length; i++){
        			if(validateNewBall([hospitals[j]],balls[i]))  {
        				if(balls[i].inside_hospital==1)  {
        					balls[i].inside_hospital=0;
        					balls[i].v.x*=slowVal_hospi;
        					balls[i].v.y*=slowVal_hospi;
        					balls[i].vabs*=slowVal_hospi;
        					}
        					balls[i].draw();
        			}
        			else  {
    				    if(balls[i].inside_hospital==0)  {
							        					balls[i].inside_hospital=1;
							        					balls[i].v.x/=slowVal_hospi;
							        					balls[i].v.y/=slowVal_hospi;
							        					balls[i].vabs/=slowVal_hospi;
							        					if(balls[i].s==1){
										        						if(balls[i].r!=global_r)
										        							balls[i].s=0;
										        						else
										        							balls[i].s=6;
										        						stateProxy.saved+=1;
									 		       						stateProxy.coins_hospi+=1;
										        						stateProxy.uninfected+=1;
							        									stateProxy.infected-=1;
							        					}
    	   				}
    	   				balls[i].draw();
		        		  }      
												}
        	}	
    	}
	    else  {
    	    for (var i = 0; i < balls.length; i++) {
        	balls[i].draw();
        	}    	
        }
        if(flag!=1)
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
        this.time = end;  //console.log(simLog);
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
			housetimer,
			hospitaltimer,
			crem
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
		housetimer,
		hospitaltimer,
		crem
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
function makeSim(population,fixedpopulation,lockedpopulation,infected)
{ 	stateProxy.population = population;
    stateProxy.fixedpopulation = fixedpopulation;
    stateProxy.lockedpopulation = lockedpopulation;
    stateProxy.infected = infected;
    stateProxy.uninfected = population - infected;
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
    	if(flag!=1)
        	sim.simulate(dt);
    } catch (e) {
        console.log(e);
        window.clearInterval(interval);
    }
}
function arrow(ctx_internal,p1,p2,size)
{
	ctx_internal.save();
	    ctx_internal.beginPath();
 		ctx_internal.arc(startPosition.x,startPosition.y,r,0,2*Math.PI, false);
      	ctx_internal.closePath();
      	if(set>0)
      		ctx_internal.fillStyle = "#003cff";
      	else
	      	ctx_internal.fillStyle = "#00CED1";  //"#00C851";  //Green circle--immunized
      	ctx_internal.fill();
    ctx_internal.fillStyle = ctx_internal.strokeStyle = '#ffaa1d';//'#099';-bluish
	ctx_internal.beginPath();
    var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy), theta=Math.atan2(dy,dx);
	var temp=parseFloat(len)/parseFloat(Math.sqrt(Math.pow(CANVAS_WIDTH,2)+Math.pow(CANVAS_HEIGHT,2)));
	velocit.x=temp*Math.cos(theta)*max_velocit;
	velocit.y=temp*Math.sin(theta)*max_velocit;
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
	if (touches!=undefined)
		startPosition=touches;
	if(startPosition!=undefined && hospital_on!=1 && house_on==1 && stateProxy.vaccines>0 && plause!=0)
	{
	if(stateProxy.vaccines>0){
		velocit.x=0;velocit.y=0;
	    ctx_1.beginPath();
 		ctx_1.arc(startPosition.x,startPosition.y,r,0,2*Math.PI, false);
      	ctx_1.closePath();
    	if(set>0)
    		ctx_1.fillStyle="#003cff";
    	else
	      	ctx_1.fillStyle = "#00CED1";  //"#00C851";  //Green circle--immunized
      	ctx_1.fill();
		isDrawStart=true;
		}
	}
}
function process_touchmove(event){
	event.preventDefault();
	var touches = getClientOffset(event, canvas_2);  //event.changedTouches;
	if(!isDrawStart) return;
		lineCoordinates=touches;
	if(lineCoordinates!=undefined && startPosition!=undefined && plause!=0)
	{
		if(hospital_on!=1 && house_on==1 && stateProxy.vaccines>0)  {
			if(stateProxy.vaccines>0){
			flag=1;
			clearCanvas(ctx_2, canvas_2);
			lineCoordinates.x=2*startPosition.x-lineCoordinates.x;
			lineCoordinates.y=2*startPosition.y-lineCoordinates.y;
			arrow(ctx_2,startPosition,lineCoordinates,5);
			}
		}
		else
			flag=0;
		}
}
function process_touchend(event) {
	event.preventDefault();  //	var touches = getClientOffset(event, canvas_1);//event.changedTouches;
	if(event)
	{
		if(hospital_on!=1 && house_on==1 && stateProxy.vaccines>0 && plause!=0)  {
		if(stateProxy.vaccines>0)  {
		flag=0;
		if(velocit.x==0)  velocit.x=immunized_initial_speed_x*posNeg()*Math.random();
		if(velocit.y==0)  velocit.y=immunized_initial_speed_y*posNeg()*Math.random();
		var newBall = new Ball(
	                startPosition.x,
	                startPosition.y,
	                velocit.x,
	                velocit.y,
	                r,
	           		healtimer,
					housetimer,
					hospitaltimer,
					crem
	            );
		newBall.vabs = Math.sqrt(Math.pow(velocit.x,2)+Math.pow(velocit.y,2));
		newBall.s=3;
	if(validateNewBall(newBall, newBall)){
		if(set>0){
			--set;
			newBall.r=5.5;
		}
		balls.unshift(newBall);  //push()
		stateProxy.immunized+=1;
		stateProxy.vaccines-=1;
		
	}	clearCanvas(ctx_2, canvas_2);	
		isDrawStart=false;
		}
	}
	else if(hospital_on==1 && stateProxy.coins_hospi>4 && plause!=0)  {
		var temp_hospi_position = (flag)?lineCoordinates:startPosition;
		var newBall = new Ball(
	                temp_hospi_position.x,
					temp_hospi_position.y,
					0,
					0,
	                r*hospital_radius_factor,
	           		healtimer,
					housetimer,
					hospitaltimer,
					crem
				);
			newBall.s=5;
			balls.unshift(newBall);
			hospitals.unshift(newBall);			
			stateProxy.coins_hospi-=5;
		}/*
	else if(house_on==1 && plause!=0)  {
		if(stateProxy.coins_lock>0){
		var min=Math.pow(startPosition.x-balls[0].p.x,2)+Math.pow(startPosition.y-balls[0].p.y,2);
		var min_id=0;
		for(var i=0; i<balls.length; i++)  {
			if(balls[i].s!=2 && balls[i].s!=4 && balls[i].s!=5 && balls[i].s!=6 && balls[i].s!=7 && balls[i].r==global_r && balls[i].r!=2*global_r)  {
				console.log('sgrrr',balls[i].r);
			var temp_dist=Math.pow(startPosition.x-balls[i].p.x,2)+Math.pow(startPosition.y-balls[i].p.y,2);
			if(temp_dist<min)  {
				min=temp_dist;
				min_id=i;
			}}
		}
		console.log('mintouch',min);
		if(min<=min_touch)  {
			console.log('id',min_id);
			house_on=0;
			balls[min_id].previous_v=balls[min_id].v;
			balls[min_id].previous_s=balls[min_id].s;
			balls[min_id].v.x=0;
			balls[min_id].v.y=0;
			balls[min_id].s=2;
			balls[min_id].partner=null;
			balls[min_id].r*=2;
			stateProxy.coins_lock-=4;
		}}
		else house_on=0;
		}*/
	}
}