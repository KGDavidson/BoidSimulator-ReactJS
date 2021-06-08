import './App.css';
import React, {useEffect, useRef} from "react";

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

class Boid {
    constructor(ctx, x, y, r, special) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = 7; // randomBetween(5, 8);
        this.checkPercent = 0.8;
        this.checkRadius = 50;
        this.special = special
    }
    draw() {
        if (this.special) {
            this.ctx.fillStyle = "green";
        } else {
            this.ctx.fillStyle = "black";
        }
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.r);
        this.ctx.beginPath();
        this.ctx.moveTo(25, 0);
        this.ctx.lineTo(-10, -10);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-10, 10);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.rotate(-this.r);
        this.ctx.translate(-this.x, -this.y);
    }
    move() {
        this.x += this.speed * Math.cos(this.r);
        this.y += this.speed * Math.sin(this.r);
    }
    wallCheck() {
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
    drawSpecial(distance, boid) {
        if (this.special && Math.abs(distance) < this.checkRadius * 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(boid.x, boid.y);
            this.ctx.stroke();
            this.ctx.closePath();
            console.log(this.speed);
        }
    }
    separation(distance, boid) {
        this.drawSpecial(distance, boid);

        if (this !== boid && Math.abs(distance) < this.checkRadius) {
            let vector1 = [Math.cos(this.r), Math.sin(this.r)];
            let vector2 = [boid.x - this.x, boid.y - this.y];
            let angle = toDegrees(Math.atan2(vector2[1], vector2[0]) - Math.atan2(vector1[1], vector1[0]));

            if (angle > 180) {
                angle -= 360
            }

            if (angle < -180) {
                angle += 360
            }

            if (Math.abs(angle) < 180 * this.checkPercent){
                this.r -= Math.abs(angle) / angle * toRadians(6);
            }
            
        }
    }
    alignment(distance, boid) {
        this.drawSpecial(distance, boid);
        if (this !== boid && Math.abs(distance) < this.checkRadius) {
            let angleDiff = boid.r - this.r;
            let speedDiff = boid.speed - this.speed;
            this.r += Math.abs(angleDiff) / angleDiff * toRadians(4);
            //this.speed += Math.abs(speedDiff) / speedDiff * 0.1;
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


function initialiseBoids(ctx, n) {
    const boids = []
    let special = true;
    for (var i = 0; i < n; i ++) {
        boids.push(new Boid(ctx, randomBetween(100, canvasWidth - 100), randomBetween(100, canvasHeight - 100), toRadians(randomBetween(180, 0)), special));
        special = false;
    }
    console.log(boids);
    return boids;
}

function App() {
    const canvasRef = useRef(null);

    useEffect(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        boids = initialiseBoids(ctx, 100);

        const render = ()=>{
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < boids.length; i++) {
                boids[i].draw(ctx);
                boids[i].move();
                boids[i].wallCheck();
                for (var j = 0; j < boids.length; j++) {
                    let distance = Math.sqrt(Math.pow(boids[i].x - boids[j].x, 2) + Math.pow(boids[i].y - boids[j].y, 2))
                    boids[i].separation(distance, boids[j]);
                    boids[i].alignment(distance, boids[j]);
                }
            }

            requestAnimationFrame(render);
        }
        render();
    }, []);

    return (<canvas id="canvas" ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>);
}

export default App;
