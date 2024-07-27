import alt from 'alt-server'

import { LiveCityEntity } from "./liveCityEntity.mjs"
import { ELiveCityState } from "../../generic/eLiveCityState.mjs"

export class LiveCityParkedVehicle extends LiveCityEntity {
    Vehicle
    
    get Vehicle() {
        return this.Vehicle
    }
    
    set Vehicle(v) {
        this.Vehicle = v
    }

    constructor() {
        super()

        //return this
    }
    async Create(modelHash, pos, rot) {
        const vehicle = await new alt.Vehicle(modelHash, pos, rot)
        
        if (!(vehicle instanceof alt.Vehicle) || !vehicle.valid)  return
        
        super.Create(vehicle)

        vehicle.setStreamSyncedMeta("LiveCity", true)
        vehicle.setStreamSyncedMeta("LiveCity:Parked", true)
        
        this.Vehicle = vehicle
    }

    Exists() {        
        return super.Exists()
    }

    Destroy() {
        this.State = ELiveCityState.Destroying
        if (this.Blip?.valid) this.Blip?.destroy()
        super.Destroy()
        if (this.Vehicle?.valid) this.Vehicle?.destroy()
     }

    IsInRangeSquared(position, rangeSquared) {
        return super.IsInRangeSquared(position, rangeSquared)
    }

    GetPosition() {
        return super.GetPosition()
    }
    
}