// Author: Progdrud(@progdruid - twitter/github)
// Title: Untitled yet

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//Simplex noise I took from web
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
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


const float edge = 0.02;
const float noise_area = 0.024;
const float noise_scale = 60.;
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    
    float line = line(st, vec2(0.240,0.500), vec2(0.9,0.9), 0.072);
    float noise = snoise(vec2(100.) + st * noise_scale) * noise_area;
    line += noise;
    vec3 outcolor = mix(vec3(1.), vec3(0.), smoothstep(0.7 - edge, 0.7 + edge, line));
    
    gl_FragColor = vec4(outcolor,1.0);
}