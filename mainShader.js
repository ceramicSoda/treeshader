export const mainVS = /*glsl*/`
    varying vec2 vUV; 
    varying vec3 vNormal; 
    
    void main(){
        vNormal = normalMatrix * normalize(normal); 
        gl_Position =  projectionMatrix * modelViewMatrix * position;
        vUV = uv; 
    }
`
export const mainFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    uniform sampler2D uTexture;
    varying vec2 vUV; 
    varying vec3 vNormal; 
    
    float getDiffuse(){
        float intensity;
        for (int i = 0; i < directionalLights.length(); i++){
            intensity = dot(directionalLights[i].direction, vNormal);
            intensity = smoothstep(0.65, 1., intensity) * 0.2 
                        + pow(smoothstep(0.65, 1., intensity), 0.5);
        }
        return intensity;
    }

    void main(){
        float gradMap = texture + getDiffuse();
        vec4 c = vec4(vec3(gradMap), 1.0);
        gl_FragColor = vec4(pow(c.xyz,vec3(0.454545)), c.w);
    }
`
