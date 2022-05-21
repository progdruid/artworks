// Author: Zack Kosovych - Progdruid(twitter/github: @progdruid)
// Title: Kosovych's black sqaure

#version 100

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

const float edge = 0.02;
const float noise_area = 0.024;
const float noise_scale = 60.;
const float line_size = 0.072;
const vec2 v1 = vec2 (0.2);
const vec2 v2 = vec2 (0.8);
const float color_amp = 0.130;
const float color_scale = 10.;

//Simplex noise I took from web
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float simplex(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                        -0.577350269189626,
                        0.024390243902439);

    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}

float fractal_noise(vec2 st){
    float value = simplex(st)/2.;
    value += simplex(st*2.)/4.;
    value += simplex(st*4.)/8.;
    value += simplex(st*8.)/16.;
    value += simplex(st*16.)/32.;
    //value += simplex(st*32.)/64.;
    //value += simplex(st*64.)/128.;
    return value;
}

float line (vec2 st, vec2 v1, vec2 v2, float size) {
    float k1 = (v2.y - v1.y) / (v2.x - v1.x);
    if (v2.x == v1.x)
        k1 = 10000.;
    float k2 = (v1.x  - v2.x) / (v2.y - v1.y);
    if (v2.y == v1.y)
        k2 = 10000.;
    float b1 = v1.y - v1.x * k1;
    float b2 = st.y - st.x * k2;
    
    float x0 = (b2 - b1) / (k1 - k2);
    float y0 = k1 * x0 + b1;
    
    bool inX = abs(v1.x - v2.x)+0.001 >= abs(v1.x - x0) + abs(v2.x - x0);
    bool inY = abs(v1.y - v2.y)+0.001 >= abs(v1.y - y0) + abs(v2.y - y0);
    float sqdist = 0.;
    if (inX && inY){
        sqdist = (k1 * st.x + b1 - st.y)*(k1 * st.x + b1 - st.y) / (k1*k1 + 1.);
    }
    else if ((v1.x - x0)*(v1.x - x0) + (v1.y - y0)*(v1.y - y0) < (v2.x - x0)*(v2.x - x0) + (v2.y - y0)*(v2.y - y0)){
        sqdist = (v1.x - st.x)*(v1.x - st.x) + (v1.y - st.y)*(v1.y - st.y);
    }
    else {
        sqdist = (v2.x - st.x)*(v2.x - st.x) + (v2.y - st.y)*(v2.y - st.y);
    }
    
    float res = (clamp(1. - sqrt(sqdist) / size, 0., 1.));
    
    return res;
}

float square (vec2 st, vec2 v1, vec2 v2) {
    float left = step(v1.x, st.x);
    float right = 1.- step (v2.x, st.x);
    float up = 1. - step (v2.y, st.y);
    float down = step (v1.y, st.y);
    return left * right * up * down;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    
    float square = square(st, v1, v2);
    float leftline = line(st, v1, vec2(v1.x,v2.y), line_size);
    float rightline = line(st, vec2(v2.x, v1.y), v2, line_size);
    float upline = line (st, vec2(v1.x, v2.y), v2, line_size);
    float downline = line (st, v1, vec2(v2.x, v1.y), line_size);
    float noise = simplex(vec2(100.) + st * noise_scale) * noise_area;
    
    float res = max(max(max(leftline, rightline), max(downline, upline)), square);
    res += noise;
    vec3 color = vec3(color_amp * (fractal_noise(st*color_scale) + 1.)/2.);
    vec3 outcolor = mix(vec3(1.), color, smoothstep(0.7 - edge, 0.7 + edge, res));
    
    gl_FragColor = vec4(outcolor,1.0);
}