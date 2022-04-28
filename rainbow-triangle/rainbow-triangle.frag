// Author: Progdrud(@progdruid - twitter/github)
// Title: Rainbow triangle

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

float linefunc (float x, vec2 v1, vec2 v2) {
    return (x - v1.x) * (v2.y - v1.y) / (v2.x - v1.x) + v1.y;
}

vec3 triangle (in vec2 pos, in vec3 curcol, in vec2 v1, in vec2 v2, in vec2 v3, in vec3 c1, in vec3 c2, in vec3 c3) {
	vec2 tempv;
    vec3 tempc;
    
    float l1 = step(v1.y, linefunc(v1.x, v2, v3));
    float l2 = step(v2.y, linefunc(v2.x, v1, v3));
    float l3 = step(v3.y, linefunc(v3.x, v1, v2));
    
    float p1 = step(pos.y, linefunc(pos.x, v2, v3));
    float p2 = step(pos.y, linefunc(pos.x, v1, v3));
    float p3 = step(pos.y, linefunc(pos.x, v1, v2));
    
    float d1 = distance(pos, v1);
    float d2 = distance(pos, v2);
    float d3 = distance(pos, v3);
    float m1 = d2 * d3;
    float m2 = d1 * d3;
    float m3 = d2 * d1;
    vec3 newcolor = 1.*(c1*m1 + c2*m2 + c3*m3) / (m1+m2+m3);
    float triangle = (1.-mod((l1+p1),2.)) * (1.-mod((l2+p2),2.)) * (1.-mod((l3+p3),2.));
    return mix(curcol, newcolor, triangle);
}


vec2 pad1 = vec2(0.025, 0.025);
vec2 pad2 = vec2(0.225, 0.325);
vec3 padcol = vec3(32, 32, 48) / 256.;
vec3 seccol = vec3(49, 49, 73) / 256.;
float slinesize = 0.005;

float sx1 = 0.075;
float sx2 = 0.125;
float sx3 = 0.175;
float ssize = 0.01;
float sy_min = 0.075;
float sy_max = 0.275;

vec2 circlecenter = vec2(0.6);
float radius = 0.3;

float period = 10.;

void main() {
    vec3 outcolor;
    
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 bgcolor = hsb2rgb(vec3(mod(u_time, period)/period, 1., 1.));
    
    //drawing pad
    float inpadhor = (step(pad1.x, st.x)) * (1.- step(pad2.x, st.x));
    float inpadver = (step(pad1.y, st.y)) * (1.- step(pad2.y, st.y));
    
    outcolor = mix(bgcolor, padcol, inpadhor * inpadver);
    
    //drawing slider lines
    float line = 0.;
    float inlinever = (1.-step((sy_max-sy_min)/2., abs((sy_max+sy_min)/2.-st.y)));
    line = (1.-step(slinesize, abs(sx1 - st.x))) * inlinever;
    outcolor = mix(outcolor, seccol, line);
    
    line = (1.-step(slinesize, abs(sx2 - st.x))) * inlinever;
    outcolor = mix(outcolor, seccol, line);
    
    line = (1.-step(slinesize, abs(sx3 - st.x))) * inlinever;
    outcolor = mix(outcolor, seccol, line);
    
    //drawing sliders
    float slider = 0.;
    slider = (1.-step(ssize, abs(sx1 - st.x))) * (1.-step(ssize, abs(mix(sy_min, sy_max,bgcolor.r) - st.y)));
    outcolor = mix(outcolor, vec3(1.,0.,0.), slider);
    
    slider = (1.-step(ssize, abs(sx2 - st.x))) * (1.-step(ssize, abs(mix(sy_min, sy_max,bgcolor.g) - st.y)));
    outcolor = mix(outcolor, vec3(0.,1.,0.), slider);
    
    slider = (1.-step(ssize, abs(sx3 - st.x))) * (1.-step(ssize, abs(mix(sy_min, sy_max,bgcolor.b) - st.y)));
    outcolor = mix(outcolor, vec3(0.,0.,1.), slider);
    
    
    //drawing circle
    float circle = (1.-step(radius, distance(st, circlecenter)));
    outcolor = mix(outcolor, padcol, circle);
    
    //triangle
    float angle1 = mod(PI/4. * sin(u_time), 2.*PI);
    float angle2 = mod(2.*PI/3. + PI/4. * sin(u_time*1.1 + PI/3.), 2.*PI);
    float angle3 = mod(4.*PI/3. + PI/4. * sin(u_time*1.5 + 2.*PI/3.), 2.*PI);
    vec2 trv1 = vec2(circlecenter.x + radius*cos(angle1), circlecenter.y + radius*sin(angle1));
    vec2 trv2 = vec2(circlecenter.x + radius*cos(angle2), circlecenter.y + radius*sin(angle2));
    vec2 trv3 = vec2(circlecenter.x + radius*cos(angle3), circlecenter.y + radius*sin(angle3));
    vec3 trc1 = hsb2rgb(vec3(mod(u_time + period/4., period)/period, 1., 1.));
    vec3 trc2 = hsb2rgb(vec3(mod(u_time + period/2., period)/period, 1., 1.));
    vec3 trc3 = hsb2rgb(vec3(mod(u_time + period*3./4., period)/period, 1., 1.));
    outcolor = triangle(st, outcolor, trv1, trv2, trv3, trc1, trc2, trc3);
    
    gl_FragColor = vec4(outcolor,1.0);
    
}