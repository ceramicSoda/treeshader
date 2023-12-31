export const leavesVS = /*glsl*/`
    uniform sampler2D uNoiseMap;
    uniform vec3 uBoxMin, uBoxSize, uRaycast;
    uniform float uTime;
    varying vec3 vObjectPos, vNormal, vWorldNormal; 
    varying float vCloseToGround;
    
    vec4 getTriplanar(sampler2D tex){
        vec4 xPixel = texture(tex, (vObjectPos.xy + uTime) / 3.);
        vec4 yPixel = texture(tex, (vObjectPos.yz + uTime) / 3.);
        vec4 zPixel = texture(tex, (vObjectPos.zx + uTime) / 3.);
        vec4 combined = (xPixel + yPixel + zPixel) / 6.0;
        combined.xyz = combined.xyz * vObjectPos; 
        return combined;
    }
    
    void main(){
        mat4 mouseDisplace = mat4(1.);
        vec3 vWorldPos = vec3(modelMatrix * instanceMatrix * mouseDisplace * vec4(position, 1.));
        vCloseToGround = clamp(vWorldPos.y, 0., 1.);
        float offset = clamp(0.8 - distance(uRaycast, instanceMatrix[3].xyz), 0., 999.); 
        offset = (pow(offset, 0.8) / 2.0) * vCloseToGround;
        mouseDisplace[3].xyz = vec3(offset);
        vNormal = normalMatrix * mat3(instanceMatrix) * mat3(mouseDisplace) * normalize(normal); 
        vWorldNormal = vec3(modelMatrix * instanceMatrix * mouseDisplace * vec4(normal, 0.));
        vObjectPos = ((vWorldPos - uBoxMin) * 2.) / uBoxSize - vec3(1.0); 
        vec4 noiseOffset = getTriplanar(uNoiseMap) * vCloseToGround; 
        vec4 newPos = instanceMatrix * mouseDisplace * vec4(position, 1.); 
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
    varying float vCloseToGround;
    
    vec3 mix3 (vec3 v1, vec3 v2, vec3 v3, float fa){
        vec3 m; 
        fa > 0.7 ? m = mix(v2, v3, (fa - .5) * 2.) : m = mix(v1, v2, fa * 2.);
        return m;
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
            intensity = smoothstep(0.55, 1., intensity) * 0.2 
                        + pow(smoothstep(0.55, 1., intensity), 0.5);
        }
        return intensity;
    }

    void main(){
        float gradMap = (getPosColors() + getDiffuse()) * vCloseToGround / 2. ;
        vec4 c = vec4(mix3(uColorA, uColorB, uColorC, gradMap), 1.0);
        gl_FragColor = vec4(pow(c.xyz,vec3(0.454545)), c.w);
    }
`
