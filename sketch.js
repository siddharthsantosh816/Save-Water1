var waterDrop, waterGroup;
var bucket;
var time,startTime, startTimeB;
var dangerImg, bucketImg, dropImg, boostImg;
var backgroundSound, collectSound, boostSound;
var danger,boost;
var score=0, highScore=0, highScorer,newName;
var PLAY = 1;
var END = 0;
var gameState;
var count=0;
var speed=10;
var restart, edges;
var flagB=0, flagA=0;

function preload(){
    dangerImg=loadImage('images/danger.png');
    bucketImg=loadImage('images/bucket.png');
    dropImg=loadImage('images/drop.png');
    boostImg=loadImage('images/thunder.png');
    backgroundSound=loadSound('sounds/rain_2.wav');
    collectSound=loadSound('sounds/collided.wav');
    boostSound=loadSound('sounds/boost.ogg');
    backgroundImg=loadImage('images/background.png');
    acidImg=loadImage('images/acid.png');
}

function setup(){
    createCanvas(600,600);
    waterGroup=createGroup();
    dangerGroup=createGroup();
    boostGroup=createGroup(); 
    acidGroup=createGroup();
    bucket=createSprite(300,550,50,100);
    bucket.addImage(bucketImg);text
    bucket.scale=0.5
    restart=createButton("Reset");
    restart.position(260,320);
    restart.size(100,40);
    restart.hide();

    edges=createEdgeSprites();
    //backgroundSound.loop();

    // create input and buttons and assign gamesate to PLAY  and capture the name from input if button pressed
  var input = createInput("Name");
  input.position(200,300);
 
  var button = createButton('Play');
  button.position(375,300);
  button.mousePressed(()=> {
    newName=input.value();
    input.hide();
    button.hide();
    gameState=PLAY;
    backgroundSound.loop();
    
});
  // read the High score from  adatabase nd assign to highScore
  database=firebase.database();
  var databaseRef=database.ref('High Score');
  databaseRef.on("value",function(data){
  highScore=data.val();
  });

  databaseRef=database.ref('High Scorer');
  databaseRef.on("value",function(data){
  highScorer=data.val();
  });
}

function draw(){
    background(backgroundImg);
    textSize(18);
    fill('white');
    text(" Your Score: "+score,460,25);
    
    bucket.collide(edges[0]);
    bucket.collide(edges[1]);

    text("Highest Score: "+highScore,15,50);
    text("High Scorer: "+highScorer,15,25)

    if(gameState===PLAY){
        spawnWater();
        spawnDanger();
        spawnBoost();
        spawnAcid();
  
        if(keyDown(RIGHT_ARROW)){
            bucket.x+=speed
        }
        
        if(keyDown(LEFT_ARROW)){
            bucket.x-=speed;
        }
    
        waterGroup.collide(bucket,dissapear);
        
        if(bucket.isTouching(dangerGroup)){
            dangerGroup[0].destroy();
            gameState=END;
        }

        if(bucket.isTouching(boostGroup)){
            boostGroup[0].destroy();
            boostSound.play();
            startTimeB=time;
            flagB=1;
        }

        if(bucket.isTouching(acidGroup)){
            acidGroup[0].destroy();
            boostSound.play();
            startTime=time;
            flagA=1;
        }

        if(time===0){
            gameState=END;
        }
        //Give preference to Acid over Boost
        if(flagA===1 && flagB===1) {
            flagB=0;
        }

        if(flagB===1){
            if(startTimeB<=time+10){
                speed=15;
                push();
                fill('red');
                text("Boost on",280,300);
                pop();
            }
            else{
                speed=10;
                flagB=0;
            }
        }

        if(flagA===1){
            if(startTime<=time+10){
                speed=5;
                push();
                fill('red');
                text("Slow Down⚠",250,300);
                pop();
            }
            else{
                speed=10;
                flagA=0;
            }
        }

        time=60-Math.round(count/frameRate());
        text("Time Left: "+time,465,50)
        count=count+1;
    }
    if(gameState===END){
        textSize(30);
        fill("red");
        restart.show();
        text("Game Over!!",220,300);
        restart.style("background","yellow");
        restart.mousePressed(function(){
            reset();
            restart.hide();
        })
        backgroundSound.stop();
        text("You did a great job by saving water😀!!",50,200);
    }
    drawSprites();

    if(score > highScore){
        highScore=score;
        highScorer=newName;
        database.ref('/').update({
          "High Scorer":highScorer,
          "High Score":score
        });
      }
}


function spawnWater(){
    var f = 35;
    console.log(flagB);
    if(flagB===1){
        f=20;
    }
    if(frameCount%f===0){
        waterDrop=createSprite(random(10,590),-20,10,10);
        waterDrop.velocityY=4+4*score/30;
        waterDrop.addImage(dropImg);
        waterDrop.scale=0.3;
        waterGroup.add(waterDrop);
        waterDrop.lifetime=150;
    }
}

function spawnDanger(){
    
    if(frameCount%580===0){
        danger=createSprite(random(10,590),-20,10,10);
        danger.velocityY=4+4*score/30;
        danger.addImage(dangerImg);
        danger.scale=0.4
        dangerGroup.add(danger);
        danger.lifetime=150;
    }
}

function spawnBoost(){
    if(frameCount%550===0){
        boost=createSprite(random(10,590),-20,10,10);
        boost.velocityY=4+4*score/30;
        boost.addImage(boostImg);
        boost.scale=0.4
        boostGroup.add(boost);
        boost.lifetime=150;
    }
}

function spawnAcid(){
    if(frameCount%520===0){
        acid=createSprite(random(10,590),-20,10,10);
        acid.velocityY=4+4*score/30;
        acid.addImage(acidImg);
        acid.scale=0.4
        acidGroup.add(acid);
        acid.lifetime=150;
    }
}

function reset(){
    gameState=PLAY;
    backgroundSound.loop();
    waterGroup.destroyEach();
    boostGroup.destroyEach();
    dangerGroup.destroyEach();
    speed=10;
    score=0;
    time=60;
    count=0;
    startTime=0;
    startTimeB=0;
    flagA = 0;
    flagB=0;
}

function dissapear(w,b){
    //console.log(w.y);
    if(w.y<495) {
        w.destroy();
        score=score+10;
        collectSound.play();
    }
}