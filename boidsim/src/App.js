import './App.css';
import React, {useEffect, useRef} from "react";

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

class Boid {
    constructor(ctx, x, y, r) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = 5;
        this.checkPercent = 0.8;
        this.checkRadius = 50;
    }
    draw() {
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
    separation(boid) {
    }
}

let boids;

function randomBetween(min, max) {
    return min + Math.random() * (max - min)
}

function initialiseBoids(ctx, n) {
    const boids = []
    for (var i = 0; i < n; i ++) {
        boids.push(new Boid(ctx, randomBetween(100, canvasWidth - 100), randomBetween(100, canvasHeight - 100), toRadians(randomBetween(180, 0))));
    }
    console.log(boids);
    return boids;
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function App() {
    const canvasRef = useRef(null);

    useEffect(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        boids = initialiseBoids(ctx, 20);

        const render = ()=>{
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < boids.length; i++) {
                boids[i].draw(ctx);
                boids[i].move();
                boids[i].wallCheck();
                for (var j = 0; j < boids.length; j++) {
                    boids[i].separation(boids[j]);
                }
            }

            requestAnimationFrame(render);
        }
        render();
    }, []);

    return (<canvas id="canvas" ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>);
}

export default App;
