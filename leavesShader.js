export const leavesVS = /*glsl*/`
    uniform vec3 uBoxMin;
    uniform vec3 uBoxSize;
    uniform float uTime;
    varying vec3 vWorldPos; 
    varying vec3 vObjectPos; 
    varying vec3 vNormal; 
    varying vec3 vViewPosition;
    
    vec3 getWind(){
            
    }
    
    void main(){
        vNormal = normalMatrix * mat3(instanceMatrix) * normalize(normal); 
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);
        vWorldPos = vec3(modelMatrix * instanceMatrix * vec4(position, 1.));
        vObjectPos = ((vWorldPos - uBoxMin) * 2.) / uBoxSize - vec3(1.0); 
        vViewPosition = -normalize((modelViewMatrix * vec4(position, 1.)).xyz);
        //gl_Position.y = (vObjectPos.x * sin(uTime + vObjectPos.z)) / 5. + gl_Position.y; 
        gl_Position.y = (vObjectPos.x * sin(uTime + vObjectPos.z)) / 5. + gl_Position.y; 
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
        gl_FragColor = vec4( pow(c.xyz,vec3(0.454545)), c.w );
        gl_FragColor = vec4( vObjectPos.xyz , 1.0 );
    }
`
