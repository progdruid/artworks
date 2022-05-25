const float threshold = 230000.;

vec3 hsb2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

vec2 mc (vec2 v1, vec2 v2) {
    float i = v1.x * v2.y + v2.x * v1.y;
    float r = v1.x * v2.x - v1.y * v2.y * sign(v1.y * v2.y);
    return vec2(r, i);
}

float mandelbrot (vec2 c, int steps) {
    vec2 z = c;
    vec2 nz = c;
    float dist = 0.;
    
    int i = 0;
    while (i < steps)  {
        z = nz;
        
        nz = mc(nz, nz);
        nz = mc(nz, nz);
        nz = mc(nz, nz);
        nz = mc(nz, nz);
        nz += mc(mc(z, z), mc(z, z)) + mc(z, z) - z;
        
        dist = distance(z, nz);
        if (dist >= threshold)
            return float(i) / float(steps);
        i++;
    }
    
    return 0.;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 st = fragCoord.xy/iResolution.xy;
    st.x *= iResolution.x/iResolution.y;
    
    st -= vec2(0.5);
    st.x -= 0.4;
    st *= 2.1;
    
    float val = mandelbrot(st, 100);
    val = sqrt(val);
    val = sqrt(val);
    val = sqrt(val);
    vec3 color = hsb2rgb(vec3(val + iTime, val, sqrt(val) + 0.3));
    
    fragColor = vec4(color,1.0);
}