import alt from 'alt-server'

import { globalConfig } from '../../shared/globalConfig.mjs'
import { EventNames } from "../../shared/eventNames.mjs"
import { RandomProvider } from "../../shared/randomProvider.mjs"
import { LiveCityDataService } from "./liveCityDataService.mjs"
import { LiveCityWanderVehicle } from "./entities/liveCityWanderVehicle.mjs"
import { LiveCityParkedVehicle } from "./entities/liveCityParkedVehicle.mjs"
import { LiveCityWanderPed } from "./entities/liveCityWanderPed.mjs"
import { LiveCityScenarioPed } from "./entities/liveCityScenarioPed.mjs"
import { ELiveCityState } from "../generic/eLiveCityState.mjs"
import { getForwardVector } from "../../shared/mathUtils.mjs"

export class LiveCityService {
	TrackedPlayers = new Map()

	WanderVehicles = new Map()
	ParkedVehicles = new Map()

	WanderPeds = new Map()
	ScenarioPeds = new Map()

	#altvEntityToLiveCity = new Map()
	
	#ParkedVehiclesBudget = new Map()
	#WanderVehiclesBudget = new Map()
	#WanderPedsBudget = new Map()
	#ScenarioPedsBudget = new Map()
	#EntityBudget = new Map()
	
	#BudgetRatioByHours = [ 0.5, 0.5, 0.4, 0.3, 0.2, 0.3, 0.5, 0.8, 1.0, 1.0, 0.8, 1.0, 0.7, 0.9, 0.9, 0.8, 1.0, 1.0, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5 ]

	#randomProvider
	#liveCityDataService
	
	#tryNext = new Map()

	intervalMsec = 100
//	intervalCheckPos = 1000
	statsArray = []

	constructor() {
		if (!globalConfig.EnableLiveCity) return

		alt.onClient(EventNames.LiveCity.s_clientRequestsDestroy, (player, id, isVehicle) => {
			let entity
			if (isVehicle) {
				// entity = alt.Vehicle.getByID(id)
				if (this.#altvEntityToLiveCity.has('vehW' + id)) {
					this.#altvEntityToLiveCity.get('vehW' + id).Destroy()
				} else if (this.#altvEntityToLiveCity.has('vehP' + id)) {
					this.#altvEntityToLiveCity.get('vehP' + id).Destroy()
				}
			} else {
				// entity = alt.Ped.getByID(id)
				if (this.#altvEntityToLiveCity.has('vehWD' + id)) {
					this.#altvEntityToLiveCity.get('vehWD' + id).Destroy()
				} else if (this.#altvEntityToLiveCity.has('pedW' + id)) {
					this.#altvEntityToLiveCity.get('pedW' + id).Destroy()
				} else if (this.#altvEntityToLiveCity.has('pedS' + id)) {
					this.#altvEntityToLiveCity.get('pedS' + id).Destroy()
				}
			}

			/*if (this.#altvEntityToLiveCity.has(entity)) {
				this.#altvEntityToLiveCity.get(entity).Destroy()
			}*/
		})

		// Driver of wander vehicle always follows vehicle's owner
		alt.on('netOwnerChange', (target, oldOwner, newOwner) => {
			if (target !== null && target !== undefined && newOwner !== null && newOwner !== undefined && target.hasStreamSyncedMeta("LiveCity:Driver")) {
				target.getStreamSyncedMeta("LiveCity:Driver")?.setNetOwner(newOwner, true)
			}
		})
		
		this.#randomProvider = new RandomProvider()
		this.#liveCityDataService = new LiveCityDataService()
	}
	
	async startService() {
		await this.#liveCityDataService.loadLiveCityDataService()
		
		const interval = new alt.Utils.Interval(this.OnTick.bind(this), globalConfig.IntervalTick)
		//alt.setInterval(this.OnTick.bind(this), globalConfig.IntervalTick)
	}
	
	SetClockHoursByPlayer(playerId, hour, densy) {
		const density = densy > 0 ? densy / 15 : 0.0
		
		this.#liveCityDataService.ClockHoursByPlayer.set(playerId, hour)
				
		this.#WanderVehiclesBudget.set(playerId, Math.round(globalConfig.LiveCity.WanderVehiclesBudget * this.#BudgetRatioByHours[hour] * density))
		this.#WanderPedsBudget.set(playerId, Math.round(globalConfig.LiveCity.WanderPedsBudget * this.#BudgetRatioByHours[hour] * density))
		this.#ScenarioPedsBudget.set(playerId, Math.round(globalConfig.LiveCity.ScenarioPedsBudget * this.#BudgetRatioByHours[hour] * density))
		
		this.#ParkedVehiclesBudget.set(playerId, Math.round(globalConfig.LiveCity.ParkedVehiclesBudget * density))	
			
		this.#EntityBudget.set(playerId, Math.min(Math.round((this.#WanderVehiclesBudget.get(playerId) * 2) + this.#WanderPedsBudget.get(playerId) + this.#ScenarioPedsBudget.get(playerId) + this.#ParkedVehiclesBudget.get(playerId)), globalConfig.LiveCity.EntityBudget))
		
		if (globalConfig.DebugStats) alt.logDebug(playerId, 'hour', hour, '/', this.#BudgetRatioByHours[hour], '/', density, '#EntityBudget', this.#EntityBudget.get(playerId), '/', this.#altvEntityToLiveCity.size, '/', (this.WanderVehicles.get(playerId).size * 2) + this.WanderPeds.get(playerId).size + this.ScenarioPeds.get(playerId).size + this.ParkedVehicles.get(playerId).size, '#WanderVehiclesBudget', this.#WanderVehiclesBudget.get(playerId), '/', this.WanderVehicles.get(playerId).size, '#WanderPedsBudget', this.#WanderPedsBudget.get(playerId), '/', this.WanderPeds.get(playerId).size, '#ScenarioPedsBudget', this.#ScenarioPedsBudget.get(playerId), '/', this.ScenarioPeds.get(playerId).size, '#ParkedVehiclesBudget', this.#ParkedVehiclesBudget.get(playerId), '/', this.ParkedVehicles.get(playerId).size)
	}

	CanSpawnVehicleAtPosition(position) {
		const vehiclesInRange = alt.getEntitiesInRange(position, 10.0, 0, 2)
		
		const playerInRange = alt.getEntitiesInRange(position, globalConfig.LiveCity.MinimumRange, 0, 1)

		return vehiclesInRange.length <= 0 && playerInRange <= 0
	}

	CanSpawnPedAtPosition(position) {
		const pedssInRange = alt.getEntitiesInRange(position, 4.0, 0, 4)

		const playerInRange = alt.getEntitiesInRange(position, globalConfig.LiveCity.MinimumRange, 0, 1)

		return pedssInRange.length <= 0 && playerInRange <= 0
	}
	
	SetupVehicle(vehicle) {
		const colors = this.#liveCityDataService.GetRandomCarColor(vehicle.Model)
		vehicle.primaryColor = colors[0]
		vehicle.secondaryColor = colors[1]
		vehicle.numberplateText = this.#liveCityDataService.GenerateNumberPlate()
		vehicle.lockState = 2
	}

	SetupPed(ped) {
		const components = {}
		if (this.#liveCityDataService.PedComponentVariations[ped.Model]) {
			const varation = this.#liveCityDataService.PedComponentVariations[ped.Model]
			for (let componentId in varation) {
				if (varation.hasOwnProperty(componentId)) {
					const zeroCompement = [0, 1, 3, 5, 7, 9, 10]
					if (zeroCompement.includes(parseInt(componentId))) {
						components[parseInt(componentId)] = [0, 0]
						continue
					}

					const value = varation[componentId]

					const chosenDrawableId = this.#randomProvider.getInt(Object.keys(value).length);
					const chosenTextureId = this.#randomProvider.getInt(value[chosenDrawableId.toString()]);

					components[componentId] = [chosenDrawableId, chosenTextureId]
				}
			}
		}

		ped.setStreamSyncedMeta("Ped:Components", components)
	}
	

	//internal record StreetNodeOption(StreetNode Node, StreetNodeConnected ConnectedNode);

	async SpawnWanderVehicle(streetNodeOption, player) {
		const laneCountForward = streetNodeOption[1].LaneCountForward
		const p0 = new alt.Vector3(streetNodeOption[0].Position.X, streetNodeOption[0].Position.Y, streetNodeOption[0].Position.Z)
		const p1 = new alt.Vector3(streetNodeOption[1].Node.Position.X, streetNodeOption[1].Node.Position.Y, streetNodeOption[1].Node.Position.Z)
		const dv = p1.sub(p0)
		const dir = dv.normalize()

		const dup = new alt.Vector3(0.0, 0.0, 1.0)
		const right = dir.cross(dup)

		const lanesTotal = laneCountForward + streetNodeOption[1].LaneCountBackward
		const laneWidth = 5.5
		const laneOffset = 0.0 // TODO: Use real value, once DurtyFree updates the dump
		let inner = laneOffset * laneWidth
		let outer = inner + Math.max(laneWidth * laneCountForward, 0.5)

		const totalWidth = lanesTotal * laneWidth
		const halfWidth = totalWidth * 0.5

		if (streetNodeOption[1].LaneCountBackward === 0) {
			inner -= halfWidth
			outer -= halfWidth
		}

		if (laneCountForward === 0) {
			inner += halfWidth
			outer += halfWidth
		}

		const v0 = p0.add(right.mul(inner))
		//Vector3 v1 = p0 + right * outer;
		//Vector3 v2 = p1 + right * inner;
		const v3 = p1.add(right.mul(outer))

		const middlePoint = v0.lerp(v3, 0.5)
		const middleOrigin = middlePoint.sub(right.mul(0.5 * laneWidth * laneCountForward))
		const chosenLane = this.#randomProvider.getInt(laneCountForward)

		const spawnPosition = middleOrigin.add(right.mul((chosenLane + 1) * laneWidth * 0.5))

		if (!this.CanSpawnVehicleAtPosition(spawnPosition)) return

		const zone = this.#liveCityDataService.GetZoneByPosition(spawnPosition)
		if (zone === null) {
			//TODO: fallback for positions which are not inside any zone. like 1368.424 -881.748 13.843
			//trackedPlayer.Emit("debug", areaPosition.Value);
			return
		}

		const chosenVehModel = this.#liveCityDataService.GetRandomVehicleModelByPosition(spawnPosition, true, false, player.id)
		const chosenDriverModelHash = this.#liveCityDataService.GetRandomPedModelByPosition(spawnPosition, player.id)

		// TODO: pitch & roll
		const rotation = new alt.Vector3(0, 0, 0 - Math.atan2(p1.x - p0.x, p1.y - p0.y))

		const wanderVehicle = new LiveCityWanderVehicle()
		
		await wanderVehicle.Create(chosenVehModel, chosenDriverModelHash, spawnPosition, rotation)
		
		if (!wanderVehicle.Vehicle.valid || !wanderVehicle.Driver.valid) return alt.logDebug('!wanderVehicle.Vehicle.valid || !wanderVehicle.Driver.valid')

		this.WanderVehicles.get(player.id).set('vehW' + wanderVehicle.id, wanderVehicle)

		this.#altvEntityToLiveCity.set('vehW' + wanderVehicle.id, wanderVehicle)
		this.#altvEntityToLiveCity.set('vehWD' + wanderVehicle.dId, wanderVehicle)

		this.SetupVehicle(wanderVehicle.Vehicle)
		this.SetupPed(wanderVehicle.Driver)

		if (!globalConfig.DebugBlip) return
		wanderVehicle.Blip = new alt.PointBlip(wanderVehicle.Vehicle.pos, true)
		wanderVehicle.Blip.sprite = 225
	 	wanderVehicle.Blip.color = 5
	}

	async SpawnParkedVehicle(carGenerator, player) {
		let chosenVehModel = 0
		if (carGenerator.Model !== 0) {
			chosenVehModel = alt.hash(carGenerator.Model)
		} else if (carGenerator.PopGroup !== "0") {
			if (this.#liveCityDataService.VehGroups.has(carGenerator.PopGroup)) {
				const hash = this.#randomProvider.getRandomItem(this.#liveCityDataService.VehGroups.get(carGenerator.PopGroup))
				chosenVehModel = alt.hash(hash)
				alt.log('hash', hash)
			}
		}

		const spawnPosition = carGenerator.Position

		if (!this.CanSpawnVehicleAtPosition(spawnPosition)) return

		if (chosenVehModel === 0) {
			const zone = this.#liveCityDataService.GetZoneByPosition(spawnPosition);
			if (zone === null) {
				//TODO: fallback for positions which are not inside any zone. like 1368.424 -881.748 13.843
				//trackedPlayer.Emit("debug", areaPosition.Value);
				alt.logWarning("Null Zone while spawning Parked Vehicle")
				return
			}

			chosenVehModel = this.#liveCityDataService.GetRandomVehicleModelByPosition(spawnPosition, false, true, player.id)
		}

		const yaw = 0 - Math.atan2(carGenerator.OrientX, carGenerator.OrientY)
		const rot = new alt.Vector3(0.0, 0.0, yaw)
		
		const parkedVehicle = new LiveCityParkedVehicle(chosenVehModel, spawnPosition, rot)
		
		await parkedVehicle.Create(chosenVehModel, spawnPosition, rot)
		
		if (!parkedVehicle.Vehicle.valid) return alt.logDebug('!parkedVehicle.Vehicle.valid')

		this.ParkedVehicles.get(player.id).set('vehP' + parkedVehicle.id, parkedVehicle)

		this.#altvEntityToLiveCity.set('vehP' + parkedVehicle.id, parkedVehicle);

		this.SetupVehicle(parkedVehicle.Vehicle)

		if (!globalConfig.DebugBlip) return
		parkedVehicle.Blip = new alt.PointBlip(parkedVehicle.Vehicle.pos, true)
		parkedVehicle.Blip.sprite = 225
		parkedVehicle.Blip.color = 1
	}

	async TryFillParkedVehicles(origin, forwardVector, player) {
		let parkedVehiclesClose = 0
		let parkedVehiclesFar = 0
		for (let [id, vehicle] of this.ParkedVehicles.get(player.id)) {
			if (vehicle.IsInRangeSquared(origin, globalConfig.LiveCity.CloseRangeSquared)){
				parkedVehiclesClose++
			} else if (this.#liveCityDataService.IsPointInsideSector(origin, vehicle.GetPosition(), forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange)) {
				parkedVehiclesFar++
			}
		}
		const totalParked = parkedVehiclesClose + parkedVehiclesFar

		const vehicleNeeded = totalParked < this.#ParkedVehiclesBudget.get(player.id)
		const closeRange = parkedVehiclesClose < this.#ParkedVehiclesBudget.get(player.id) / (globalConfig.LiveCity.CloseRange / globalConfig.LiveCity.MinimumRange)

		if (vehicleNeeded) {
			const carGenerator = closeRange
				? this.#liveCityDataService.GetRandomCarGenInRange(origin, globalConfig.LiveCity.CloseRange, globalConfig.LiveCity.MinimumRange)
				: this.#liveCityDataService.GetRandomCarGenInSector(origin, forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange, globalConfig.LiveCity.CloseRange)

			if (carGenerator !== null) {
				await this.SpawnParkedVehicle(carGenerator, player)
			}
		}

		return [parkedVehiclesClose, parkedVehiclesFar]
	}

	async TryFillWanderVehicles(origin, forwardVector, player) {
		let wanderVehiclesClose = 0
		let wanderVehiclesFar = 0
		for (let [id, vehicle] of this.WanderVehicles.get(player.id)) {
			if (vehicle.IsInRangeSquared(origin, globalConfig.LiveCity.CloseRangeSquared)) {
				wanderVehiclesClose++
			} else if (this.#liveCityDataService.IsPointInsideSector(origin, vehicle.GetPosition(), forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange)) {
				wanderVehiclesFar++
			}
		}
		const totalWander = wanderVehiclesClose + wanderVehiclesFar

		const vehicleNeeded = totalWander < this.#WanderVehiclesBudget.get(player.id)
		const closeRange = wanderVehiclesClose < this.#WanderVehiclesBudget.get(player.id) / (globalConfig.LiveCity.CloseRange / globalConfig.LiveCity.MinimumRange)

		if (vehicleNeeded) {
			const spawnNodeOption = closeRange
				? this.#liveCityDataService.GetRandomStreetNodeInRange(origin, globalConfig.LiveCity.CloseRange, globalConfig.LiveCity.MinimumRange)
				: this.#liveCityDataService.GetRandomStreetNodeInSector(origin, forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange, globalConfig.LiveCity.CloseRange)

			if (spawnNodeOption !== null) await this.SpawnWanderVehicle(spawnNodeOption, player)
		}

		return [wanderVehiclesClose, wanderVehiclesFar]
	}

	async SpawnWanderPed(position, player) {
		const chosenModelHash = this.#liveCityDataService.GetRandomPedModelByPosition(position, player.id)
		
		if(!chosenModelHash || chosenModelHash === 3074996681) return alt.logWarning('!chosenModelHash || chosenModelHash === 3074996681 SpawnWanderPed')
		
		const spawnPos = position.add(new alt.Vector3(0.0, 0.0, 1.0))
		
		if (!this.CanSpawnPedAtPosition(spawnPos)) return

		const wanderPed = new LiveCityWanderPed(chosenModelHash, spawnPos)
		
		await wanderPed.Create(chosenModelHash, spawnPos)
		
		if (!wanderPed.Ped.valid) return

		this.WanderPeds.get(player.id).set('pedW' + wanderPed.id, wanderPed)

		this.#altvEntityToLiveCity.set('pedW' + wanderPed.id, wanderPed)

		this.SetupPed(wanderPed.Ped)
		
		if (!globalConfig.DebugBlip) return
		wanderPed.Blip = new alt.PointBlip(wanderPed.Ped.pos, true)
		wanderPed.Blip.sprite = 480
	}

	async SpawnScenarioPed(scenarioPoint, player) {
		const spawnPos = new alt.Vector3(scenarioPoint.Position.X, scenarioPoint.Position.Y, scenarioPoint.Position.Z)
		
		if (!this.CanSpawnPedAtPosition(spawnPos)) return

		const chosenGroup = scenarioPoint.ModelType
		const chosenModelHash = chosenGroup === "none" || !this.#liveCityDataService.PedModelGroups.has(chosenGroup)
			? this.#liveCityDataService.GetRandomPedModelByPosition(spawnPos, player.id)
			: alt.hash(this.#randomProvider.choice(this.#liveCityDataService.PedModelGroups.get(chosenGroup)))
		
		const rot = new alt.Vector3(0.0, 0.0, scenarioPoint.Position.W)
		const scenarioPed = new LiveCityScenarioPed()
		
		await scenarioPed.Create(chosenModelHash, scenarioPoint.IType, spawnPos, rot)
		
		if (!scenarioPed.Ped.valid) return

		this.ScenarioPeds.get(player.id).set('pedS' + scenarioPed.id, scenarioPed)

		this.#altvEntityToLiveCity.set('pedS' + scenarioPed.id, scenarioPed)

		this.SetupPed(scenarioPed.Ped)

		if (!globalConfig.DebugBlip) return
		scenarioPed.Blip = new alt.PointBlip(scenarioPed.Ped.pos, true)
		scenarioPed.Blip.sprite = 480
		scenarioPed.Blip.color = 2
	}

	async TryFillWanderPeds(origin, forwardVector, player) {
		let wanderPedsClose = 0
		let wanderPedsFar = 0
		for (let [id, ped] of this.WanderPeds.get(player.id)) {
			if (ped.IsInRangeSquared(origin, globalConfig.LiveCity.CloseRangeSquared)) {
				wanderPedsClose++
			} else if (this.#liveCityDataService.IsPointInsideSector(origin, ped.GetPosition(), forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange)) {
				wanderPedsFar++
			}
		}

		const totalWanderPeds = wanderPedsClose + wanderPedsFar

		const pedNeeded = totalWanderPeds < this.#WanderPedsBudget.get(player.id)
		const closeRange = wanderPedsClose < this.#WanderPedsBudget.get(player.id) / (globalConfig.LiveCity.CloseRange / globalConfig.LiveCity.MinimumRange)

		if (pedNeeded) {
			const areaPosition = closeRange
				? this.#liveCityDataService.GetRandomFootpathPointInRange(origin, globalConfig.LiveCity.CloseRange, globalConfig.LiveCity.MinimumRange)
				: this.#liveCityDataService.GetRandomFootpathPointInSector(origin, forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange, globalConfig.LiveCity.CloseRange)

			if (areaPosition !== null && areaPosition !== undefined) {
				await this.SpawnWanderPed(areaPosition, player)
			}
		}

		return [wanderPedsClose, wanderPedsFar]
	}

	async TryFillScenarioPeds(origin, forwardVector, player) {
		let scenarioPedsClose = 0
		let scenarioPedsFar = 0
		for (let [id, ped] of this.ScenarioPeds.get(player.id)) {
			if (ped.IsInRangeSquared(origin, globalConfig.LiveCity.CloseRangeSquared)) {
				scenarioPedsClose++
			} else if (this.#liveCityDataService.IsPointInsideSector(origin, ped.GetPosition(), forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange)) {
				scenarioPedsFar++
			}
		}

		const totalScenarioPeds = scenarioPedsClose + scenarioPedsFar

		const pedNeeded = totalScenarioPeds < this.#ScenarioPedsBudget.get(player.id)
		const closeRange = scenarioPedsClose < this.#ScenarioPedsBudget.get(player.id) / (globalConfig.LiveCity.CloseRange / globalConfig.LiveCity.MinimumRange)

		if (pedNeeded) {
			const scenarioPoint = closeRange
				? this.#liveCityDataService.GetRandomScenarioPointInRange(origin, globalConfig.LiveCity.CloseRange, globalConfig.LiveCity.MinimumRange)
				: this.#liveCityDataService.GetRandomScenarioPointInSector(origin, forwardVector, globalConfig.LiveCity.FarSectorHalfAngle, globalConfig.StreamingRange, globalConfig.LiveCity.CloseRange)

			if (scenarioPoint !== null) {
				await this.SpawnScenarioPed(scenarioPoint, player)
			}
		}

		return [scenarioPedsClose, scenarioPedsFar]
	}

	async OnTick() {
		const now = Date.now()

		for (let [k, entity] of this.#altvEntityToLiveCity) {
			let nbFinded = 0
			for (let trackedPlayer of this.TrackedPlayers.values()) {
				if (!(trackedPlayer instanceof alt.Player) || !trackedPlayer.valid || !trackedPlayer.isSpawned) continue

				const allLiveCityEntities = [...this.ParkedVehicles.get(trackedPlayer.id).values(), ...this.WanderVehicles.get(trackedPlayer.id).values(), ...this.WanderPeds.get(trackedPlayer.id).values(), ...this.ScenarioPeds.get(trackedPlayer.id).values()]
				const finded = allLiveCityEntities.filter((enti) => enti === entity)

				nbFinded += finded.length
			}
			if (nbFinded <= 0) {
				entity.Destroy()
				this.#altvEntityToLiveCity.delete(k)
			}
		}

		for (let trackedPlayer of this.TrackedPlayers.values()) {
			if (!(trackedPlayer instanceof alt.Player) || !trackedPlayer.valid || !trackedPlayer.isSpawned) continue
			
//			for (let entity of this.ScenarioPeds.get(trackedPlayer.id).values()) {
//				if (entity.State !== ELiveCityState.CheckPos || !entity.Exists()) continue
//
//				if (entity.Pos.distanceTo(entity.Ped.pos) > 5.0) {
//					entity.Ped.pos = entity.Pos
//					entity.State = ELiveCityState.Active
//				}
//				
//				if (Date.now() - entity.Timer > this.intervalCheckPos) 	entity.State = ELiveCityState.Active
//			}
			
			
			const allLiveCityEntities = [...this.ParkedVehicles.get(trackedPlayer.id).values(), ...this.WanderVehicles.get(trackedPlayer.id).values(), ...this.WanderPeds.get(trackedPlayer.id).values(), ...this.ScenarioPeds.get(trackedPlayer.id).values()]

			// Update lifetime states
			for (let entity of allLiveCityEntities) {
				const exists = entity.Exists()

				switch (entity.State) {
					case ELiveCityState.JustCreated:
//						if (entity instanceof LiveCityScenarioPed && exists) {
//							entity.State = ELiveCityState.CheckPos
//							break
//						}
						if (exists) entity.State = ELiveCityState.Active
						break
					case ELiveCityState.Active:
						if (!exists) {
							// TODO: return to cache
							entity.Destroy()
						}						
						break
					case ELiveCityState.Destroying:
						break
					default:
						break
					}
			}
			
			// Cleanup destroyed entities
			for (let entity of allLiveCityEntities.filter((enti) => enti.State === ELiveCityState.Destroying)) {
				if (entity instanceof LiveCityParkedVehicle) {
					this.ParkedVehicles.get(trackedPlayer.id).delete('vehP' + entity.id)
					this.#altvEntityToLiveCity.delete('vehP' + entity.id)
				} else if (entity instanceof LiveCityWanderVehicle) {
					this.WanderVehicles.get(trackedPlayer.id).delete('vehW' + entity.id)
					this.#altvEntityToLiveCity.delete('vehW' + entity.id)
					this.#altvEntityToLiveCity.delete('vehWD' + entity.dId)
				} else if (entity instanceof LiveCityWanderPed) {
					this.WanderPeds.get(trackedPlayer.id).delete('pedW' + entity.id)
					this.#altvEntityToLiveCity.delete('pedW' + entity.id)
				} else if (entity instanceof LiveCityScenarioPed) {
					this.ScenarioPeds.get(trackedPlayer.id).delete('pedS' + entity.id)
					this.#altvEntityToLiveCity.delete('pedS' + entity.id)
				}
			}

			const playerPosition = trackedPlayer.pos
			const playerForwardVector = getForwardVector(trackedPlayer.rot)

			// Cull by sector
			for (let entity of allLiveCityEntities) {
				if (entity.State !== ELiveCityState.Active) {
					continue
				}

				// Never cull close range
				if (entity.IsInRangeSquared(playerPosition, globalConfig.LiveCity.CloseRangeSquared)) {
					continue
				}

				if (!this.#liveCityDataService.IsPointInsideSector(playerPosition,
						entity.GetPosition(), playerForwardVector,
						globalConfig.LiveCity.FarSectorHalfAngle,
						globalConfig.StreamingRange))
				{
					// TODO: return to cache
					entity.Destroy();
				}
			}

			// Update blips positions
			if (globalConfig.DebugBlip) {
				for (let [id, wanderVehicle] of this.WanderVehicles.get(trackedPlayer.id)) {
					if (wanderVehicle.Blip instanceof alt.PointBlip && wanderVehicle.Vehicle instanceof alt.Vehicle && wanderVehicle.Blip.valid && wanderVehicle.Vehicle.valid) wanderVehicle.Blip.pos = wanderVehicle.Vehicle.pos
				}
				for (let [id, wanderPed] of this.WanderPeds.get(trackedPlayer.id)) {
					if (wanderPed.Blip instanceof alt.PointBlip && wanderPed.Ped instanceof alt.Ped && wanderPed.Blip.valid && wanderPed.Ped.valid) wanderPed.Blip.pos = wanderPed.Ped.pos
				}
			}

			const allVehicles = alt.Vehicle.all
			const allPlayers = alt.Player.all
			const allPeds = alt.Ped.all
			const allEntities = [...allVehicles, ...allPlayers, ...allPeds]

			let entitiesInRange = allEntities.filter((entity) => entity.valid && entity.pos.distanceTo(playerPosition) < globalConfig.StreamingRange).length

			// alt.emitClient(trackedPlayer, EventNames.LiveCity.s_updateDebugEntityCount, entitiesInRange)	

			// if we have no budget to spawn
			//TODO: think about destroying entities if we hit the limit
			if (entitiesInRange >= this.#EntityBudget.get(trackedPlayer.id)) {
				continue
			}
			
			if (this.#tryNext.get(trackedPlayer.id) === 0) {
				if (this.ParkedVehicles.get(trackedPlayer.id).size < this.#ParkedVehiclesBudget.get(trackedPlayer.id)) {
					const [closeParked, farParked] = await this.TryFillParkedVehicles(playerPosition, playerForwardVector, trackedPlayer)
					//alt.emitClient(trackedPlayer, EventNames.LiveCity.s_updateDebugParkedData, closeParked, farParked)
				}
			}

			if (this.#tryNext.get(trackedPlayer.id) === 1) {
				if (this.WanderVehicles.get(trackedPlayer.id).size < this.#WanderVehiclesBudget.get(trackedPlayer.id)) {
					const [closeWander, farWander] = await this.TryFillWanderVehicles(playerPosition, playerForwardVector, trackedPlayer)
					//alt.emitClient(trackedPlayer, EventNames.LiveCity.s_updateDebugWanderData, closeWander, farWander)
				}
			}

			if (this.#tryNext.get(trackedPlayer.id) === 2) {
				if (this.WanderPeds.get(trackedPlayer.id).size < this.#WanderPedsBudget.get(trackedPlayer.id)) {
					const [closeWanderPeds, farWanderPeds] = await this.TryFillWanderPeds(playerPosition, playerForwardVector, trackedPlayer)
					//alt.emitClient(trackedPlayer, EventNames.LiveCity.s_updateDebugWanderPedData, closeWanderPeds, farWanderPeds)
				}
			}
			
			if (this.#tryNext.get(trackedPlayer.id) === 3) {
				if (this.ScenarioPeds.get(trackedPlayer.id).size < this.#ScenarioPedsBudget.get(trackedPlayer.id)) {
					const [closeScenarioPeds, farScenarioPeds] = await this.TryFillScenarioPeds(playerPosition, playerForwardVector, trackedPlayer)
					//alt.emitClient(trackedPlayer, EventNames.LiveCity.s_updateDebugScenarioPedData, closeScenarioPeds, farScenarioPeds)
				}
			}
			
			if (this.#tryNext.get(trackedPlayer.id) < 4) {
				this.#tryNext.set(trackedPlayer.id, this.#tryNext.get(trackedPlayer.id) + 1)
			} else {
				this.#tryNext.set(trackedPlayer.id, 0)
			}
		}

		const tickTime = Date.now() - now
		const delta = this.intervalMsec - tickTime
		if (delta < 0) {
			alt.logWarning("LiveCityService::OnTick took too long:", tickTime, "msec!");
		}

		//const delay = Math.max(0, delta)
		//await alt.Utils.wait(delay)
		
		if (!globalConfig.DebugStats) return
		
		this.statsArray.push(tickTime)
		
		if (this.statsArray.length >= 100) {
			const average = this.statsArray.reduce((sum, current) => sum + current, 0) / this.statsArray.length
			alt.log('Average TickTime', average, '/', this.statsArray.length, 'min', Math.min(...this.statsArray), 'max', Math.max(...this.statsArray))
			const averageWV = this.#liveCityDataService.statsTest.reduce((sum, current) => sum + current, 0) / this.#liveCityDataService.statsTest.length
			alt.log('Average test TickTime', averageWV, '/', this.#liveCityDataService.statsTest.length, 'min', Math.min(...this.#liveCityDataService.statsTest), 'max', Math.max(...this.#liveCityDataService.statsTest))
			const averageWV2 = this.#liveCityDataService.statsTest2.reduce((sum, current) => sum + current, 0) / this.#liveCityDataService.statsTest2.length
			alt.log('Average test2 size', averageWV2, '/', this.#liveCityDataService.statsTest2.length, 'min', Math.min(...this.#liveCityDataService.statsTest2), 'max', Math.max(...this.#liveCityDataService.statsTest2))
			this.statsArray = []
			this.#liveCityDataService.statsTest = []
			this.#liveCityDataService.statsTest2 = []
		}
	}

	AddPlayer(player)	{
		this.WanderPeds.set(player.id, new Map())
		this.WanderVehicles.set(player.id, new Map())
		this.ScenarioPeds.set(player.id, new Map())
		this.ParkedVehicles.set(player.id, new Map())
		
		this.#tryNext.set(player.id, 0)
		
		this.TrackedPlayers.set(player.id, player)
		alt.log("[LiveCity-js] Player Connected")
	}

	RemovePlayer(player) {
		this.TrackedPlayers.delete(player.id)
		
		this.#tryNext.delete(player.id)
		
		this.ParkedVehicles.delete(player.id)
		this.ScenarioPeds.delete(player.id)
		this.WanderVehicles.delete(player.id)
		this.WanderPeds.delete(player.id)
		alt.log("[LiveCity-js] Player Disconnected");
	}
}