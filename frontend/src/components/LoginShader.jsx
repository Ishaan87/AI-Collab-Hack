import React, { useEffect } from 'react';

const LoginShader = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            const canvas = document.querySelector(".login-shader-canvas");
            if (!canvas) return;

            const vertexShaderSource = `
                attribute vec3 aPosition;
                void main() {
                    vec4 positionVec4 = vec4(aPosition, 1.0);
                    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
                    gl_Position = positionVec4;
                }
            `;

            const fragmentShaderSource = `
                #ifdef GL_ES
                precision highp float;
                #endif
                #define PI 3.14159265359
                #define TWO_PI 6.28318530718
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform vec2 u_mouse;
                uniform float u_dpr;
                uniform vec3 u_col1;
                uniform vec3 u_col2;
                uniform vec3 u_col3;
                uniform vec3 u_col4;

                float rand(vec2 co){
                    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453) / u_dpr;
                }

                float map(float value, float min1, float max1, float min2, float max2) {
                    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
                }

                vec4 circle(vec2 st, vec2 center, float radius, float blur, vec3 col){
                    float dist = distance(st,center)*2.0;
                    vec4 f_col = vec4(1.0-smoothstep(radius, radius + blur, dist));
                    f_col.r *= col.r;
                    f_col.g *= col.g;
                    f_col.b *= col.b;
                    return f_col;
                }

                void main(){
                    vec2 fst = gl_FragCoord.xy/u_resolution.xy;
                    float aspect = u_resolution.x/u_resolution.y;
                    vec2 pst = fst * vec2(aspect, 1.);
                    vec2 mst = fst;
                    vec2 m = u_mouse.xy/u_resolution.xy;

                    // Colors from HeroShader
                    vec3 col1 = vec3(232.0, 64.0, 13.0) / 255.0; 
                    vec3 col2 = vec3(255.0, 238.0, 216.0) / 255.0;  
                    vec3 col3 = vec3(208.0, 178.0, 255.0) / 255.0;

                    vec4 color = vec4(0.);

                    vec2 purpleC = vec2(m.x, 1.-m.y);
                    float purpleR = .75;
                    float purpleB = .75;
                    vec3 purpleCol = col1;

                    vec2 mintC = vec2(.5+sin(u_time*.4)*.5*cos(u_time*.2)*.5, .5+sin(u_time*.3)*.5*cos(u_time*.5)*.5);
                    float mintR = 1.;
                    float mintB = 1.;
                    vec3 mintCol = col2;

                    vec2 greenC = vec2((.5+cos(u_time*.5)*.5*sin(u_time*.2)*.5)*aspect, .5+cos(u_time*.4)*(.5)*sin(u_time*.3)*.5);
                    float greenR = 1.;
                    float greenB = 1.;
                    vec3 greenCol = col3;

                    pst.x += sin(u_time*.15+pst.x*19.)*.37 * cos(u_time*.46+pst.y*25.)*.28;
                    pst.y += cos(u_time*.27+pst.x*4.)*.45 * sin(u_time*.24+pst.y*8.)*.22;

                    mst.x += cos(u_time*.37+mst.x*15.)*.21 * sin(u_time*.14+mst.y*7.)*.29 * (m.x - .5) * 12.;
                    mst.y += sin(u_time*.15+mst.x*13.)*.37 * cos(u_time*.36+mst.y*5.)*.12 * (m.y - .5) * 12.;

                    vec4 color1 = vec4(0.);
                    vec4 color2 = vec4(0.);
                    vec4 color3 = vec4(0.);
                    vec4 color4 = vec4(0.);
                    vec4 color5 = vec4(0.);

                    color1 += vec4((circle(mst, mintC, mintR, mintB, vec3(1.)) - circle(mst, mintC, mintR, mintB, vec3(1.)) * circle(mst, greenC, greenR, greenB, vec3(1.))));
                    color2 += vec4((circle(mst, mintC, mintR, mintB, vec3(1.)) - circle(mst, mintC, mintR, mintB, vec3(1.)) * circle(mst, purpleC, purpleR, purpleB, vec3(1.))));

                    color1 -= color1 * color2;
                    color2 -= color1 * color2;

                    color3 = color1;
                    color4 = color2;
                    color3.rgb *= purpleCol;
                    color4.rgb *= greenCol;

                    color += color3;
                    color += color4;

                    color5 += vec4((circle(mst, greenC, greenR, greenB, vec3(1.)) - circle(mst, greenC, greenR, greenB, vec3(1.)) * circle(mst, mintC, mintR, mintB, vec3(1.))));
                    color5 -= color1 * color2;
                    color5.rgb *= mintCol;
                    color += color5;

                    color += circle(mst, mintC, mintR, mintB, mintCol) * (color1 - circle(mst, mintC, mintR, mintB, vec3(1.))) * (color2 - circle(mst, mintC, mintR, mintB, vec3(1.)));

                    float noise = rand(fst*10.) * .2;
                    color.rgb *= 1. - vec3(noise);
                    gl_FragColor = color;
                }
            `;

            let gl = canvas.getContext("webgl");
            const m = { x: 0, y: 0 };

            if (!gl) {
                console.warn("WebGL not supported, falling back on experimental-webgl");
                gl = canvas.getContext("experimental-webgl");
            }

            if (!gl) {
                console.error("Your browser does not support WebGL");
                return;
            }

            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
                if (success) {
                    return shader;
                }
                console.log(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

            function createProgram(gl, vertexShader, fragmentShader) {
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                const success = gl.getProgramParameter(program, gl.LINK_STATUS);
                if (success) {
                    return program;
                }
                console.log(gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
            }

            const program = createProgram(gl, vertexShader, fragmentShader);
            const positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            function resizeCanvasToDisplaySize(canvas) {
                const displayWidth = canvas.clientWidth;
                const displayHeight = canvas.clientHeight;
                if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;
                }
            }

            const u_resolution = gl.getUniformLocation(program, "u_resolution");
            const u_time = gl.getUniformLocation(program, "u_time");
            const u_mouse = gl.getUniformLocation(program, "u_mouse");
            const u_dpr = gl.getUniformLocation(program, "u_dpr");

            let startTime = Date.now();
            let mouse = [0, 0];
            window.addEventListener("mousemove", (e) => {
                mouse[0] = e.clientX;
                mouse[1] = e.clientY;
            });

            function render() {
                resizeCanvasToDisplaySize(gl.canvas);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(program);

                gl.enableVertexAttribArray(positionAttributeLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                const size = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

                m.x += (mouse[0] - m.x) * 0.025;
                m.y += (mouse[1] - m.y) * 0.025;

                const resolution = [gl.canvas.width, gl.canvas.height];
                gl.uniform2fv(u_resolution, resolution);
                gl.uniform1f(u_time, (Date.now() - startTime) * 0.0025);
                gl.uniform2fv(u_mouse, [m.x, m.y]);
                gl.uniform1f(u_dpr, window.devicePixelRatio || 1);

                const primitiveType = gl.TRIANGLES;
                const count = 6;
                gl.drawArrays(primitiveType, 0, count);

                requestAnimationFrame(render);
            }

            requestAnimationFrame(render);

            window.addEventListener("resize", () => {
                resizeCanvasToDisplaySize(canvas);
                const resolution = [gl.canvas.width, gl.canvas.height];
                gl.uniform2fv(u_resolution, resolution);
            });
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="absolute inset-x-0 bottom-0 w-full pointer-events-none z-0 overflow-hidden" style={{ height: '600px', maskImage: 'linear-gradient(to bottom, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}>
            <canvas
                className="login-shader-canvas w-full h-full block"
                width="942"
                height="640"
                style={{
                    backgroundColor: "#fbfaf9",
                }}
            ></canvas>
        </div>
    );
};

export default LoginShader;
