import alt from 'alt-server'

import { LiveCityEntity } from "./liveCityEntity.mjs"
import { ELiveCityState } from "../../generic/eLiveCityState.mjs"

export class LiveCityWanderPed extends LiveCityEntity {
    Ped

    get Ped() {
        return this.Ped
    }

    set Ped(p) {
        this.Ped = p
    }
    
    constructor() {
        super()

        //return this
    }

    async Create(modelHash, pos) {
        const ped = await new alt.Ped(modelHash, pos, alt.Vector3.zero)

        if (!(ped instanceof alt.Ped) || !ped.valid) return

        super.Create(ped)

        ped.setStreamSyncedMeta("LiveCity", true)
        ped.setStreamSyncedMeta("LiveCity:WanderPed", true)

        this.Ped = ped
    }

    Exists() {
        return super.Exists()
    }

    Destroy() {
        this.State = ELiveCityState.Destroying
        if (this.Blip?.valid) this.Blip?.destroy()
        super.Destroy()
        if (this.Ped?.valid) this.Ped?.destroy()
    }

    IsInRangeSquared(position, rangeSquared) {
        return super.IsInRangeSquared(position, rangeSquared)
    }

    GetPosition() {
        return super.GetPosition()
    }

}