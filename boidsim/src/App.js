import './App.css';
import React, {useEffect, useRef} from "react";

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

const boidCount = 150;

const boidScale = 1.5;
const boidCheckRadius = 100;
const boidCheckPercent = 0.7;
const boidSpeed = 7;
const boidAlignmentAngVel = 4;
const boidCohesionAngVel = 5;
const boidSeparationAngVel = 6;
const boidWallCheckAngVel = 3;

class Boid {
    constructor(ctx, x, y, r, special) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = boidSpeed;
        this.checkPercent = boidCheckPercent;
        this.checkRadius = boidCheckRadius;
        this.special = special;
        this.scale = boidScale;
        this.separationAngVel = boidSeparationAngVel;
        this.alignmentAngVel = boidAlignmentAngVel;
        this.cohesionAngVel = boidCohesionAngVel;
        this.wallCheckAngVel = boidWallCheckAngVel;
        this.colour = "rgb(" + randomBetween(111, 195) + "," + randomBetween(8, 34) + "," + randomBetween(63, 50) + ")";
        /*if (this.special) {
            this.colour = "#ffffff";
        }*/
    }
    setSpecial(bool) {
        this.special = bool;
    }
    draw() {
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.r);
        this.ctx.beginPath();
        this.ctx.moveTo(25 / 2 * this.scale, 0);
        this.ctx.lineTo(-10 / 2 * this.scale, -10 / 2 * this.scale);
        this.ctx.lineTo(-5 / 2  * this.scale, 0);
        this.ctx.lineTo(-10 / 2 * this.scale, 10 / 2 * this.scale);
        this.ctx.closePath();
        if (this.special) {
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        this.ctx.fillStyle = this.colour;
        this.ctx.fill();
        this.ctx.rotate(-this.r);
        this.ctx.translate(-this.x, -this.y);
    }
    drawSpecialLine(boid) {
        if (this.special) {
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(boid.x, boid.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }
    move() {
        this.r += toRadians(randomBetween(-2, 2));
        this.x += this.speed * Math.cos(this.r);
        this.y += this.speed * Math.sin(this.r);
    }
    normaliseAngle(angle) {
        if (angle > 180) {
            angle -= 360;
        }

        if (angle < -180) {
            angle += 360;
        }
        return angle;
    }
    wallCheck() {
        let bottomWall = this.y + this.checkRadius * 2 > canvasHeight;
        let topWall = this.y - this.checkRadius * 2 < 0;

        let leftWall = this.x - this.checkRadius * 2 < 0;
        let rightWall = this.x + this.checkRadius * 2 > canvasWidth;


        if (bottomWall | topWall) {
            let vector1 = [Math.cos(this.r), Math.sin(this.r)];
            let vector2 = [0, 1];
            let angle = toDegrees(Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]));

            if (angle > 180) {
                angle -= 360
            }

            if (angle < -180) {
                angle += 360
            }

            if (Math.abs(angle) < 180 * this.checkPercent){
                let setAngle = angle;
                if (topWall){
                    setAngle = -angle;
                }
                this.r -= Math.abs(setAngle) / setAngle * toRadians(this.wallCheckAngVel);
            }
        }

        
        if (rightWall | leftWall) {
            let vector1 = [Math.cos(this.r), Math.sin(this.r)];
            let vector2 = [1, 0];
            let angle = toDegrees(Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]));

            if (angle > 180) {
                angle -= 360
            }

            if (angle < -180) {
                angle += 360
            }

            if (Math.abs(angle) < 180 * this.checkPercent){
                let setAngle = angle;
                if (leftWall){
                    setAngle = -angle;
                }
                this.r -= Math.abs(setAngle) / setAngle * toRadians(this.wallCheckAngVel);
            }
        }

        if (this.x < 0) {
            this.x += canvasWidth;
        }
        
        if (this.x > canvasWidth) {
            this.x -= canvasWidth;
        }

        
        if (this.y < 0) {
            this.y += canvasHeight;
        }
        
        if (this.y > canvasHeight) {
            this.y -= canvasHeight;
        }
    }
    separation(boid) {
        let vector1 = [Math.cos(this.r), Math.sin(this.r)];
        let vector2 = [boid.x - this.x, boid.y - this.y];
        let angle = toDegrees(Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]));

        angle = this.normaliseAngle(angle);

        if (Math.abs(angle) < 180 * this.checkPercent){
            this.r -= Math.abs(angle) / angle * toRadians(this.separationAngVel);
        }
    }
    alignment(boid) {
        let angleDiff = boid.r - this.r;
        this.r += Math.abs(angleDiff) / angleDiff * toRadians(this.alignmentAngVel);
    }
    cohesion(boidsNearX, boidsNearY) {
        let centre = [sum(boidsNearX) / boidsNearX.length, sum(boidsNearY) / boidsNearY.length];
        
        let vector1 = [Math.cos(this.r), Math.sin(this.r)];
        let vector2 = [centre[0] - this.x, centre[1] - this.y];
        let angle = toDegrees(Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]));

        angle = this.normaliseAngle(angle);

        if (Math.abs(angle) < 180 * this.checkPercent){
            this.r += Math.abs(angle) / angle * toRadians(this.cohesionAngVel);
        }
    }
}

let boids;

function randomBetween(min, max) {
    return min + Math.random() * (max - min)
}

function toRadians (angle) {
    return angle * Math.PI / 180;
}

function toDegrees (angle) {
    return angle / Math.PI * 180;
}

function sum(list) {
    return list.reduce((a, b) => a + b, 0)
}


function initialiseBoids(ctx, n) {
    const boids = []
    for (var i = 0; i < n; i ++) {
        boids.push(new Boid(ctx, randomBetween(100, canvasWidth - 100), randomBetween(100, canvasHeight - 100), toRadians(randomBetween(0, 360)), false));
    }
    boids[Math.round(randomBetween(0, boids.length))].setSpecial(true);
    return boids;
}

function App() {
    const canvasRef = useRef(null);

    useEffect(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        boids = initialiseBoids(ctx, boidCount);

        const render = ()=>{
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < boids.length; i++) {
                let boidsNearX = [];
                let boidsNearY = [];
                for (var j = 0; j < boids.length; j++) {
                    let distance = Math.sqrt(Math.pow(boids[i].x - boids[j].x, 2) + Math.pow(boids[i].y - boids[j].y, 2))
                    if (boids[i] !== boids[j] && Math.abs(distance) < boids[i].checkRadius) {
                        boids[i].drawSpecialLine(boids[j]);
                        boidsNearX.push(boids[j].x);
                        boidsNearY.push(boids[j].y);
                        boids[i].alignment(boids[j]);
                        boids[i].separation(boids[j]);
                    }
                }
                boids[i].cohesion(boidsNearX, boidsNearY);
                boids[i].draw();
                boids[i].move();
                boids[i].wallCheck();
            }

            requestAnimationFrame(render);
        }
        render();
    }, []);

    return (<canvas id="canvas" ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>);
}

export default App;
