export const leavesVS = /*glsl*/`
    varying vec3 vWorldPos; 
    varying vec3 vNormal; 
    varying vec3 vViewPosition;
    void main(){
        vNormal = normalMatrix * mat3(instanceMatrix) * normalize(normal); 
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);
        vWorldPos = vec3(modelMatrix * instanceMatrix * vec4(position, 1.));
        vViewPosition = -normalize((modelViewMatrix * vec4(position, 1.)).xyz);
    }
`
export const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    varying vec3 vWorldPos;
    varying vec3 vNormal; 
    varying vec3 vViewPosition;
    uniform vec3    uColor;
    uniform float   uState; 

    vec3 getDiffuse(){
        vec3 l = vec3(uColor);
        float intensity = dot(directionalLights[0].direction, vNormal);
        intensity = smoothstep(0.5, 0.7, intensity);
        l = vec3(   uColor.r + (intensity / 10.0),
                    uColor.g + (intensity / 6.0), 
                    uColor.b + (intensity / 18.0)); 
        return l;
    }

    void main(){
        vec4 c = vec4(uColor, 1.0);
        c.xyz = getDiffuse();
        gl_FragColor = vec4( pow(c.xyz,vec3(0.454545)), c.w );
    }
`
