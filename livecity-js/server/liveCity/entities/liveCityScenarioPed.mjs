import alt from 'alt-server'

import { LiveCityEntity } from "./liveCityEntity.mjs"
import { ELiveCityState } from "../../generic/eLiveCityState.mjs"

export class LiveCityScenarioPed extends LiveCityEntity {
    Ped
    Pos

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
    
    async Create(modelHash, scenario, pos, rot) {
        this.Pos = pos
        
        const ped = await new alt.Ped(modelHash, pos, rot)
        
        if (!(ped instanceof alt.Ped) || !ped.valid) return

        super.Create(ped)

        ped.setStreamSyncedMeta("LiveCity", true)
        ped.setStreamSyncedMeta("LiveCity:ScenarioPed", scenario)
        ped.setStreamSyncedMeta("LiveCity:ScenarioPed:pos", pos)
        ped.setStreamSyncedMeta("LiveCity:ScenarioPed:rot", rot)
        
        this.Ped = ped
//        this.Timer = Date.now()
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