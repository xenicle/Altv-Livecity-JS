import alt from 'alt-server'

import { ELiveCityState } from "../../generic/eLiveCityState.mjs"

export class LiveCityEntity {
    Entity   
    State = ELiveCityState.JustCreated
    Blip
    id = 0

    constructor() {
    }
    
    Create(entity) {
        this.Entity = entity
        this.id = entity.id
    }
    
    get State(){
        return this.State
    }
    
    set State(s) {
        this.State = s
    }
    
    Exists() {
        return (this.Entity instanceof alt.Entity) && this.Entity.valid && this.Entity.streamed && this.Entity.netOwner !== null
    }
    
    Destroy() {
        this.State = ELiveCityState.Destroying
        if (this.Blip?.valid) this.Blip?.destroy()
        if (this.Entity?.valid) this.Entity?.destroy()
    }
	
    IsInRangeSquared(position, rangeSquared) {
        return (this.Entity instanceof alt.Entity) && this.Entity.valid && position.distanceToSquared(this.Entity.pos) <= rangeSquared
    }
    
    GetPosition() {
        if (!(this.Entity instanceof alt.Entity) || !this.Entity.valid) return alt.Vector3.zero
        return this.Entity.pos
    }
 }