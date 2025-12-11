varying vec3 vColor;


void main() {

    // point star
    float strength = (1.0 - distance(gl_PointCoord, vec2(0.5)));
    strength = pow(strength, 10.0);

    vec3 finalColor = mix(vec3(0.0),vColor, strength);

    gl_FragColor = vec4(finalColor, 1.0);
}