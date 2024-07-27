import * as alt from 'alt-client'
import * as native from 'natives'

import { EventNames } from "../shared/eventNames.mjs"
import { RandomProvider } from "../shared/randomProvider.mjs";

alt.on('resourceStart', () => {
    alt.log("LiveCity-js Started!")
    
    alt.on('connectionComplete', () => {
        alt.loadDefaultIpls()
    })
    
    alt.on('spawned', () => {
        alt.emitServer(EventNames.LiveCity.s_playerSpawned)

        alt.setInterval(() => {
            const wanderVehs = alt.Vehicle.all.filter((vehicle) => vehicle.valid &&
                vehicle.scriptID !== 0 &&
                vehicle.isSpawned &&
                vehicle.netOwner === alt.Player.local &&
                vehicle.hasStreamSyncedMeta("LiveCity:Driver") &&
                vehicle.getStreamSyncedMeta("LiveCity:Driver").valid &&
                !native.isPedInVehicle(vehicle.getStreamSyncedMeta("LiveCity:Driver"), vehicle, false))
            
            //if (wanderVehs.length) alt.log('wanderVeh', wanderVehs.length)
            
            wanderVehs.forEach(async (vehicle) => {
                try {
                    const ped = vehicle.getStreamSyncedMeta("LiveCity:Driver")

                    //await SetPedDrivingWander(veh.getStreamSyncedMeta("LiveCity:Driver"), vehicle)

                    await alt.Utils.waitFor(() => {
                        if(!ped.valid || !vehicle.valid) return false
                        if (!native.isPedInVehicle(ped, vehicle, false)){
                            native.setPedIntoVehicle(ped, vehicle, -1)
                        }
                        return native.isPedInVehicle(ped, vehicle, false)
                    }, 10000)

                    if (!ped.valid || !vehicle.valid) return

                    setPedValue(ped)
                    
                    native.taskVehicleDriveWander(ped, vehicle, 13.0, 807339)
                } catch(err) {
                    // alt.logError(err)
                }
            })

            const wanderPeds = alt.Ped.all.filter((ped) => ped.valid &&
                ped.scriptID !== 0 &&
                ped.isSpawned &&
                ped.netOwner === alt.Player.local &&
                ped.hasStreamSyncedMeta("LiveCity:WanderPed") &&
                !native.getIsTaskActive(ped, 221))

            //if (wanderPeds.length) alt.log('wanderPed', wanderPeds.length)

            wanderPeds.forEach((ped) => {
                setPedValue(ped)
                
                native.taskWanderStandard(ped, 40000.0, 0)
            })

            const scenerioPeds = alt.Ped.all.filter((ped) => ped.valid &&
                ped.scriptID !== 0 &&
                ped.isSpawned &&
                ped.netOwner === alt.Player.local &&
                ped.hasStreamSyncedMeta("LiveCity:ScenarioPed") &&
                !ped.getMeta("LiveCity:ScenarioPed:CheckScenrio") &&
                !native.isPedUsingScenario(ped, ped.getStreamSyncedMeta("LiveCity:ScenarioPed")))

            //if (scenerioPeds.length) alt.log('scenerioPeds', scenerioPeds.length)

            scenerioPeds.forEach((ped) => {
                setPedValue(ped)
                
                const scenario = ped.getStreamSyncedMeta("LiveCity:ScenarioPed")
                // alt.log('scenario', scenario)
                native.taskStartScenarioInPlace(ped, scenario, 0, false)
                ped.setMeta("LiveCity:ScenarioPed:CheckScenrio", true)
            })
                        
        }, 500)
        
        alt.setInterval(() => {
            const scenerioPeds = alt.Ped.all.filter((ped) => ped.valid &&
                ped.scriptID !== 0 &&
                ped.isSpawned &&
                ped.netOwner === alt.Player.local &&
                ped.hasStreamSyncedMeta("LiveCity:ScenarioPed") &&
                !ped.getMeta("LiveCity:ScenarioPed:CheckRePos") &&
                ped.hasStreamSyncedMeta("LiveCity:ScenarioPed:pos") &&
                ped.hasStreamSyncedMeta("LiveCity:ScenarioPed:rot") &&
                native.isPedUsingScenario(ped, ped.getStreamSyncedMeta("LiveCity:ScenarioPed")) &&
                ped.pos.distanceTo(ped.getStreamSyncedMeta("LiveCity:ScenarioPed:pos")) > 5.0)

            //if (scenerioPeds.length) alt.log('scenerioPeds', scenerioPeds.length)

            scenerioPeds.forEach((ped) => {
                const pos = ped.getStreamSyncedMeta("LiveCity:ScenarioPed:pos")
                const rot = ped.getStreamSyncedMeta("LiveCity:ScenarioPed:rot")
                native.setEntityCoords(ped, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, true)
                ped.setMeta("LiveCity:ScenarioPed:CheckRePos", true)
            })
                        
        }, 500)
        
        alt.setInterval(() => {
            let density = 0

            const playerPos = alt.Player.local.pos

            const [getNode, nodePos] = native.getClosestVehicleNode(playerPos.x, playerPos.y, playerPos.z, alt.Vector3.zero, 1, 100.0, 2.5)

            if (getNode) {
                const [getProperty, densy, flag] = native.getVehicleNodeProperties(nodePos.x, nodePos.y, nodePos.z, 0, 0)

                if (getProperty) {
                    density = densy
                    // alt.log('getProperty', getProperty,'density', densy, 'flag', flag)
                }
            }

            alt.emitServer(EventNames.LiveCity.s_clientSendClockHours, native.getClockHours(), density)
        }, 1000)
    })
    
    

    alt.on('netOwnerChange', async (target, newOwner,  oldOwner) => {
        try {
            if (!(target instanceof alt.Entity) || !target.valid)  return
            
            // Not a LiveCity
            if (!target.hasStreamSyncedMeta("LiveCity")) {
                return
            }

            // We are not owning it
            if (newOwner !== alt.Player.local) {
                //native.networkFadeOutEntity(target, false, false)
                return
            }

            // Entity was just created (not migrated)
            if (oldOwner === null) {
                native.networkFadeInEntity(target, true, 0)
            }

            if (target instanceof alt.Vehicle) {
                await HandleVehicle(target)
            } else if (target instanceof alt.Ped) {
                await HandlePed(target)
            }
        } catch(err) {
            alt.logError(err)
        }
    })
})

alt.on('resourceStop', () => {
    alt.log("LiveCity-js Stopped!")
})

async function SetPedDrivingWander(ped, vehicle) {
    native.setVehicleOnGroundProperly(vehicle, 5.0)
    try {
        await alt.Utils.waitFor(() => {
            if (!native.isPedInVehicle(ped, vehicle, false)){
                native.setPedIntoVehicle(ped, vehicle, -1)
            }
            return native.isPedInVehicle(ped, vehicle, false)
        }, 3000)
    } catch(err) {
        alt.logError('!ped inside veh', vehicle.valid)
        if (vehicle.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, vehicle.remoteID, true)
        return
    }
    
    // https://forge.plebmasters.de/vehicleflags?category=DrivingStyleFlags&value=802987
    if (vehicle.valid && ped.valid) native.taskVehicleDriveWander(ped, vehicle, 13.0, 807339)
}

async function HandleVehicle(vehicle) {
    try {
        await alt.Utils.waitFor(() => vehicle.scriptID !== 0 && native.hasModelLoaded(vehicle.model), 10000)
    } catch(err) {
        if (vehicle.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, vehicle.remoteID, true)
        return
    }
    
    if(!vehicle.valid) return
    
    if (vehicle.hasStreamSyncedMeta("LiveCity:Driver")) {
        const driver = vehicle.getStreamSyncedMeta("LiveCity:Driver")

        try {
            await alt.Utils.waitFor(() => driver.scriptID !== 0 && native.hasModelLoaded(driver.model) && driver.isSpawned, 3000)
        } catch(err) {
            if (vehicle.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, vehicle.remoteID, true)
            if (driver.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, driver.remoteID, false)
            return
        }

        if (vehicle.valid && driver.valid && vehicle.isSpawned && driver.isSpawned) {
            if (vehicle.netOwner === driver.netOwner) {
                await SetPedDrivingWander(driver, vehicle)
            } else {
                alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, vehicle.remoteID, true)
            }
        } else {
            if (vehicle.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, vehicle.remoteID, true)
            if (driver.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, driver.remoteID, false)
        }
    }
}

async function HandlePed(ped) {
    try {
        await alt.Utils.waitFor(() => ped.scriptID !== 0 && native.hasModelLoaded(ped.model), 10000)
    } catch(err) {
        if (ped && ped.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, ped.remoteID, false)
        return
    }

    if (!ped.valid) return
    
    let assignedVehicle
    if (ped.hasStreamSyncedMeta("LiveCity:Vehicle")) {
        assignedVehicle = ped.getStreamSyncedMeta("LiveCity:Vehicle")
        try {
            await alt.Utils.waitFor(() => assignedVehicle.scriptID !== 0 && native.hasModelLoaded(assignedVehicle.model) && assignedVehicle.isSpawned, 3000)
        } catch(err) {
            if (assignedVehicle && assignedVehicle.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, assignedVehicle.remoteID, true)
            if (ped && ped.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, ped.remoteID, false)
            return
        }
    }
    
    if (!ped.valid) {
        if (assignedVehicle && assignedVehicle.valid) alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, assignedVehicle.remoteID, true)
        return
    }

    // Maybe despawned while waiting
    if (!ped.isSpawned) {
        alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, ped.remoteID, false)
        return
    }

    if (ped.hasStreamSyncedMeta("Ped:Components")) {
        const components = ped.getStreamSyncedMeta("Ped:Components")
        for (let key in components) {
            if (components.hasOwnProperty(key)) {
                native.setPedComponentVariation(ped, Number(key), components[key][0], components[key][1], 2)
            }
        }
    }

    setPedValue(ped)

    if (ped.hasStreamSyncedMeta("LiveCity:ScenarioPed")) {
        if(ped.hasStreamSyncedMeta("LiveCity:ScenarioPed:Pos") && ped.hasStreamSyncedMeta("LiveCity:ScenarioPed:Rot") && ped.pos.distanceTo(ped.getStreamSyncedMeta("LiveCity:ScenarioPed:Pos")) > 3.0) {
            const pos = ped.getStreamSyncedMeta("LiveCity:ScenarioPed:Pos")
            const rot = ped.getStreamSyncedMeta("LiveCity:ScenarioPed:Rot")
            native.setEntityCoords(ped, pos.x, pos.y, pos.z + 2.0, rot.x, rot.y, rot.z, true)
        }
        /*const [isGet, onGroundPos] = native.getSafeCoordForPed(ped.pos.x, ped.pos.y, ped.pos.z, true, alt.Vector3.zero, 16)
        if (isGet) {
            ped.pos = onGroundPos
        }*/
        const scenario = ped.getStreamSyncedMeta("LiveCity:ScenarioPed")
        native.taskStartScenarioInPlace(ped, scenario, 0, false)
    } else if (ped.hasStreamSyncedMeta("LiveCity:WanderPed")) {
        native.taskWanderStandard(ped, 40000.0, 0)
    } else if ((assignedVehicle instanceof alt.Vehicle) && assignedVehicle.isSpawned) {
        if (ped.netOwner === assignedVehicle.netOwner) {
            await SetPedDrivingWander(ped, assignedVehicle)
        } else {
            alt.emitServer(EventNames.LiveCity.s_clientRequestsDestroy, ped.remoteID, false)
        }
    }
}

function setPedValue (ped){
    if (!ped.valid) return

    const randomProvider = new RandomProvider()

    native.setEntityCanBeDamaged(ped, false)
    native.setPedCanBeTargetted(ped, false)
    native.setDriverAbility(ped, randomProvider.getFloat())
    native.setDriverAggressiveness(ped, randomProvider.getFloat())
    //native.setPedConfigFlag(ped, 251, true)
    native.setPedConfigFlag(ped, 17, true)
    native.setPedConfigFlag(ped, 64, true)
    native.setPedConfigFlag(ped, 134, true)
    native.setPedConfigFlag(ped, 151, true)
    native.setPedConfigFlag(ped, 229, true)
    native.setPedConfigFlag(ped, 350, true)
    native.setPedConfigFlag(ped, 398, true)
    native.setPedStayInVehicleWhenJacked(ped, true)
    native.setPedCanBeDraggedOut(ped, false)
    native.setEntityShouldFreezeWaitingOnCollision(ped, false)
    native.setBlockingOfNonTemporaryEvents(ped, true)
}