"use client";

import React, { useEffect, useRef } from "react";

interface NovatrixProps {
  color?: [number, number, number];
  amplitude?: number;
  speed?: number;
  className?: string;
}

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform float u_amplitude;
uniform float u_speed;

// Classic Simplex / Perlin style sine-wave field for Novatrix silk ribbons
void main() {
  vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 mouse = (u_mouse * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  
  float distToMouse = length(st - mouse);
  st += (st - mouse) * exp(-distToMouse * 3.0) * 0.15;

  float t = u_time * u_speed * 0.5;
  vec3 color = vec3(0.0);

  for (float i = 1.0; i < 6.0; i++) {
    st.x += u_amplitude * sin(st.y * 2.5 + t * 0.8 + i * 1.3) / i;
    st.y += u_amplitude * cos(st.x * 2.2 + t * 0.6 + i * 1.7) / i;
  }

  float wave = sin(st.x * 3.0 + st.y * 3.0 + t);
  float intensity = smoothstep(-0.6, 0.8, wave);

  // Gradient mixing tailored to ember highlights
  vec3 deepBg = vec3(0.05, 0.04, 0.08);
  vec3 emberGlow = u_color;
  vec3 highlight = vec3(1.0, 0.82, 0.4);

  color = mix(deepBg, emberGlow, intensity * 0.7);
  color += highlight * pow(intensity, 4.0) * 0.45;

  // Subtle vignette
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  color *= 1.0 - length(uv - 0.5) * 0.6;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function Novatrix({
  color = [1.0, 0.45, 0.18], // Ember orange default
  amplitude = 0.35,
  speed = 1.0,
  className = "",
}: NovatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const colorLoc = gl.getUniformLocation(program, "u_color");
    const ampLoc = gl.getUniformLocation(program, "u_amplitude");
    const speedLoc = gl.getUniformLocation(program, "u_speed");

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = canvas.height - (e.clientY - rect.top);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      if (!canvas || !gl) return;
      const elapsed = (performance.now() - startTime) / 1000;

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform2f(mouseLoc, mouseX, mouseY);
      gl.uniform3f(colorLoc, color[0], color[1], color[2]);
      gl.uniform1f(ampLoc, amplitude);
      gl.uniform1f(speedLoc, speed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [color, amplitude, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-none ${className}`}
    />
  );
}
