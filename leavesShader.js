export const leavesVS = /*glsl*/`
    varying vec2    vUV;
    void main(){
        vUV = vec2(1.)  - uv; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    }
`
export const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    uniform vec3    uColor;
    uniform float   uState; 
    varying vec2    vUV;
    void main(){
        vec3 cLight = vec3(uColor.r + 1., uColor.g + .1, uColor.b);
        vec4 c = vec4(uColor * step(vUV.y, (uState)), 1.); 
        c = c + vec4(cLight * step(uState, vUV.y) * step(vUV.y, (uState + 0.15)),  1.);
        gl_FragColor = vec4( pow(c.xyz,vec3(0.454545)), c.w );
    }
`
