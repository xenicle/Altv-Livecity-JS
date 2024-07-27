import alt from 'alt-server'

import { EventNames } from "../shared/eventNames.mjs"

import { LiveCityService } from "./liveCity/liveCityService.mjs"
//import { LiveCityDataService } from './liveCity/liveCityDataService.mjs'

alt.on('resourceStart', async (err) => {
    alt.log("[LiveCity-js Server] Starting")
    
    const liveCityService = new LiveCityService()
    
    await liveCityService.startService()
    
    /*alt.on('playerConnect', (player) => {
        liveCityService.AddPlayer(player)
    })*/
    
    alt.onClient(EventNames.LiveCity.s_playerSpawned, async (player) => {
        liveCityService.AddPlayer(player)
    })
    
    alt.on('playerDisconnect', (player) => {
        liveCityService.RemovePlayer(player)
    })
    
    alt.onClient(EventNames.LiveCity.s_clientSendClockHours, (player, hour, density) => {
        liveCityService.SetClockHoursByPlayer(player.id, hour, density)
    })
})


alt.on('resourceStop', () => {
    alt.log("[LiveCity-js Server] Stopping")
})


/*async function essaiDataService(){
    const dataService = new LiveCityDataService()
    
    await dataService.loadLiveCityDataService()
    
    const pos = new alt.Vector3(0.0, 0.0, 74)
    const range = 100
        
    //alt.log(dataService.GetRandomStreetNodeInRange(pos, range))
    alt.log(dataService.GetRandomFootpathPointInRange(pos, range))
}*/

//essaiDataService()