export const leavesVS = /*glsl*/`
    uniform vec3 uBoxMin;
    uniform vec3 uBoxSize;
    uniform float uTime;
    uniform sampler2D uNoiseMap;
    varying vec3 vWorldPos; 
    varying vec3 vObjectPos; 
    varying vec3 vNormal; 
    varying vec3 vWorldNormal; 
    varying vec3 vViewPosition;
    
    vec4 getTriplanar(sampler2D tex){
        vec4 xPixel = texture(tex, (vObjectPos.xy + uTime) / 4.);
        vec4 yPixel = texture(tex, (vObjectPos.yz + uTime) / 4.);
        vec4 zPixel = texture(tex, (vObjectPos.xz + uTime) / 4.);
        vec4 combined = (xPixel + yPixel + zPixel) / 12.0;
        combined.xyz = combined.xyz * vObjectPos; 
        return combined;
    }
    
    void main(){
        vNormal = normalMatrix * mat3(instanceMatrix) * normalize(normal); 
        vWorldNormal = vec3(modelMatrix * instanceMatrix * vec4(normal, 0.));
        vWorldPos = vec3(modelMatrix * instanceMatrix * vec4(position, 1.));
        vObjectPos = ((vWorldPos - uBoxMin) * 2.) / uBoxSize - vec3(1.0); 
        vViewPosition = -normalize((modelViewMatrix * vec4(position, 1.)).xyz);
        vec4 noiseOffset = getTriplanar(uNoiseMap); 
        vec4 newPos = instanceMatrix * vec4(position, 1.); 
        newPos.xyz = newPos.xyz + noiseOffset.xyz;
        gl_Position =  projectionMatrix * modelViewMatrix * newPos;
        //gl_Position =  projectionMatrix * modelViewMatrix * instanceMatrix * vec4(newPos, 1.);
    }
`
export const leavesFS = /*glsl*/`
    #include <common> 
    #include <lights_pars_begin>
    varying vec3 vObjectPos; 
    varying vec3 vWorldPos;
    varying vec3 vNormal; 
    varying vec3 vViewPosition;
    varying vec3 vWorldNormal; 
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    
    float getPosColors(){
        float p = 0.;
        p = smoothstep(0.2, 0.8, distance(vec3(0.), vObjectPos));
        p = p *  (-(vWorldNormal.g / 2.) + 0.5) * (- vObjectPos.y / 2. + 0.5); 
        return p;
    }

    float getFakeSSS(){
        float sss = 0.;
        for (int i = 0; i < directionalLights.length(); i++){
            vec3 l = (directionalLights[i].direction + normalize(-vViewPosition)); 
            sss = pow(dot(vNormal, l), 2.) / 6.;
        }
        return sss; 
    }
    float getDiffuse(){
        float intensity;
        for (int i = 0; i < directionalLights.length(); i++){
            intensity = dot(directionalLights[i].direction, vNormal);
            intensity = pow(smoothstep(0.75, 1., intensity), 0.2);
        }
        return intensity;
    }

    void main(){
        //vec4 c = vec4(uColor, 1.0);
        //c = vec4(vec3(getPosColors() + getFakeSSS()), c.w);
        //c = c + vec4(vec3(getDiffuse()), c.w);
        float gradMap = getPosColors() + getFakeSSS() + getDiffuse();
        vec4 c = vec4(mix(uColorA, uColorB, gradMap), 1.0);
        gl_FragColor = vec4( pow(c.xyz,vec3(0.454545)), c.w );
    }
`
