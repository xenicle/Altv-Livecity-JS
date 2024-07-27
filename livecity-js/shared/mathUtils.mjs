import * as alt from 'alt-shared'

export function getForwardVector(rotation){
    // Roll Pitch Yaw
    const z = rotation.z
    const x = rotation.x
    const num = Math.abs(Math.cos(x))

    return new alt.Vector3(-Math.sin(z) * num, Math.cos(z) * num, Math.sin(x))
}

export function toRadians(x) {
    return x * Math.PI / 180.0
}

export function vector3Length (v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}