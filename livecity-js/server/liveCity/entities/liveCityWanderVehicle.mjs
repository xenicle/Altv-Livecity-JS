import alt from 'alt-server'

import { LiveCityEntity } from "./liveCityEntity.mjs"
import { ELiveCityState } from "../../generic/eLiveCityState.mjs"

export class LiveCityWanderVehicle extends LiveCityEntity {
    Vehicle
    Driver
    dId = 0

    get Vehicle() {
        return this.Vehicle
    }

    set Vehicle(v) {
        this.Vehicle = v
    }
    
    get Driver() {
        return this.Driver
    }

    set Driver(d) {
        this.Driver = d
    }
    
    constructor() {
        super()

        // return this
    }

    async Create(modelHash, driverModelHash, pos, rot) {
        const vehicle = await new alt.Vehicle(modelHash, pos, rot)
        const driver = await new alt.Ped(driverModelHash, pos, rot)


        if (!(vehicle instanceof alt.Vehicle) || !vehicle.valid) {
            this.Destroy()
            return
        }

        if (!(driver instanceof alt.Ped) || !driver.valid) {
            this.Destroy()
            return
        }
        
        super.Create(vehicle)

        vehicle.setStreamSyncedMeta("LiveCity", true)
        vehicle.setStreamSyncedMeta("LiveCity:Wander", true)
        vehicle.setStreamSyncedMeta("LiveCity:Driver", driver)
     
        driver.setStreamSyncedMeta("LiveCity", true)
        driver.setStreamSyncedMeta("LiveCity:Vehicle", vehicle)

        this.Vehicle = vehicle

        this.dId = driver.id
        this.Driver = driver
    }

    Exists() {
        return super.Exists() && (this.Driver instanceof alt.Ped) && this.Driver.valid && this.Driver.streamed && this.Driver.netOwner !== null
    }

    Destroy() {
        this.State = ELiveCityState.Destroying
        if (this.Blip?.valid) this.Blip?.destroy()
        super.Destroy()
        if (this.Driver?.valid) this.Driver?.destroy()
        if (this.Vehicle?.valid) this.Vehicle?.destroy()
    }

    IsInRangeSquared(position, rangeSquared) {
        return super.IsInRangeSquared(position, rangeSquared)
    }

    GetPosition() {
        return super.GetPosition()
    }

}