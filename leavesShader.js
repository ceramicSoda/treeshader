export const leavesVS = /*glsl*/`
    varying vec3 vWorldPos; 
    void main(){
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);
        vWorldPos = vec3(modelMatrix * instanceMatrix * vec4(position, 1.));
    }
`
export const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    varying vec3 vWorldPos;
    uniform vec3    uColor;
    uniform float   uState; 
    void main(){
        vec4 c = vec4(uColor, 1.0);
        //c = vec4(vWorldPos, 1.0);
        //gl_FragColor = vec4( pow(c.xyz,vec3(0.454545)), c.w );
        gl_FragColor = c; 
    }
`
