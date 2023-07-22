export const leavesVS = /*glsl*/`
    uniform sampler2D uNoiseMap;
    uniform vec3 uBoxMin, uBoxSize, uRaycast;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    
    vec4 getTriplanar(sampler2D tex){
        vec4 xPixel = texture(tex, (vObjectPos.xy + uTime) / 4.);
        vec4 yPixel = texture(tex, (vObjectPos.yz + uTime) / 4.);
        vec4 zPixel = texture(tex, (vObjectPos.zx + uTime) / 4.);
        vec4 combined = (xPixel + yPixel + zPixel) / 6.0;
        combined.xyz = combined.xyz * vObjectPos; 
        return combined;
    }
    
    void main(){
        mat4 mouseDisplace = mat4(1.);
        mouseDisplace[3].xyz = uRaycast; 

        vNormal = normalMatrix * mat3(instanceMatrix) * normalize(normal); 
        vWorldNormal = vec3(modelMatrix * instanceMatrix * vec4(normal, 0.));
        vec3 vWorldPos = vec3(modelMatrix * instanceMatrix * vec4(position, 1.));
        vObjectPos = ((vWorldPos - uBoxMin) * 2.) / uBoxSize - vec3(1.0); 
        vec4 noiseOffset = getTriplanar(uNoiseMap); 
        vec4 newPos = instanceMatrix * vec4(position, 1.); 
        newPos.xyz = newPos.xyz + noiseOffset.xyz;
        gl_Position =  projectionMatrix * modelViewMatrix * newPos;
    }
`
export const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    uniform vec3 uColorA, uColorB, uColorC;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    
    vec3 mix3 (vec3 v1, vec3 v2, vec3 v3, float fa){
        vec3 tmp = mix(v2, v1, fa);
        return (mix(tmp, v3, fa));
    }

    float getPosColors(){
        float p = 0.;
        p = smoothstep(0.2, 0.8, distance(vec3(0.), vObjectPos));
        p = p * (-(vWorldNormal.g / 2.) + 0.5) * (- vObjectPos.y / 9. + 0.5); 
        return p;
    }
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
        float gradMap = getPosColors() + getDiffuse();
        vec4 c = vec4(mix3(uColorA, uColorB, uColorC, gradMap), 1.0);
        gl_FragColor = vec4(pow(c.xyz,vec3(0.454545)), c.w);
    }
`
