export const leavesVS = /*glsl*/`
    uniform vec3 uBoxMin;
    uniform vec3 uBoxSize;
    uniform float uTime;
    uniform sampler2D uNoiseMap;
    varying vec3 vWorldPos; 
    varying vec3 vObjectPos; 
    varying vec3 vNormal; 
    varying vec3 vViewPosition;
    
    vec4 getTriplanar(sampler2D tex){
        vec4 xPixel = texture(tex, (vObjectPos.xy + uTime) / 3.);
        vec4 yPixel = texture(tex, (vObjectPos.yz + uTime) / 3.);
        vec4 zPixel = texture(tex, (vObjectPos.xz + uTime) / 3.);
        vec4 combined = (xPixel + yPixel + zPixel) / 3.0;
        combined.xyz = combined.xyz * vObjectPos; 
        return combined;
    }
    
    void main(){
        vNormal = normalMatrix * mat3(instanceMatrix) * normalize(normal); 
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
    uniform vec3 uColor;
    uniform float uTime;

    vec3 getPosColors(){
        vec3 p = vec3(pow((1. - vNormal.y - 0.4), 4.)) * uColor * vObjectPos;
        return p;
    }

    vec3 getDiffuse(){
        vec3 l;
        float intensity;
        for (int i = 0; i < directionalLights.length(); i++){
            intensity = dot(directionalLights[i].direction, vNormal);
            intensity = pow(smoothstep(0.75, 1., intensity), 0.3);
            //l = l + vec3(intensity / 10.0, intensity / 6.0, intensity / 18.0); 
            l = l + intensity * (uColor * directionalLights[i].color) / 2.; 
        }
        return l;
    }

    void main(){
        vec4 c = vec4(uColor, 1.0);
        c = vec4(c.xyz + getDiffuse(), c.w);
        //c = vec4(c.xyz + getPosColors(), c.w);
        //gl_FragColor = vec4( pow(c.xyz,vec3(0.454545)), c.w );
        gl_FragColor = vec4( vObjectPos.xyz , 1.0 );
    }
`
