import alt from 'alt-server'

import xmlJs from 'xml-js'
import { readFile } from 'fs/promises'

import { globalConfig } from '../../shared/globalConfig.mjs'
import { RandomProvider } from "../../shared/randomProvider.mjs"
import { vector3Length, toRadians } from "../../shared/mathUtils.mjs"
import { CellCoord, NavigationMeshProvider } from '../navigation/navigationMeshProvider.mjs'

import StreetNodes from '../data/LiveCity/ExtendedNodes.json' assert { type: "json" }
import PedComponentVariations from '../data/LiveCity/pedComponentVariations.json' assert { type: "json" }
import vehicles from '../data/LiveCity/vehicles.json' assert { type: "json" }
import ScenarioPoints from '../data/LiveCity/ScenarioPoints.json' assert { type: "json" }
import AllowedScenarios from '../data/LiveCity/AllowedScenarios.json' assert { type: "json" }
import PedModelGroup from '../data/LiveCity/PedModelGroup.json' assert { type: "json" }
import CarModels from '../data/LiveCity/CarModels.json' assert { type: "json" }
import ColorlessCars from '../data/LiveCity/ColorlessCars.json' assert { type: "json" }
import CarColorsNum from '../data/LiveCity/CarColorsNum.json' assert { type: "json" }

/*class VehicleEntry {
    Name
    Hash
    BoundingSphereRadius
    Flags

    constructor() {
    }
            
    get Name() {
        return this.Name
    }

    set Name(n) {
        this.Name = n
    }

    get Hash() {
        return this.Hash
    }

    set Hash(h) {
        this.Hash = h
    }

    get BoundingSphereRadius() {
        return this.BoundingSphereRadius
    }

    set BoundingSphereRadius(bsr) {
        this.BoundingSphereRadius = bsr
    }

    get Flags() {
        return this.Flags
    }

    set Flags(f) {
        this.Flags = f
    }
}

class StreetNodeConnected {
    Node
    LaneCountForward
    LaneCountBackward

    constructor() {
    }
    
    get Node() {
        return this.Node
    }

    set Node(n) {
        this.Node = n
    }

    get LaneCountForward() {
        return this.LaneCountForward
    }

    set LaneCountForward(lcf) {
        this.LaneCountForward = lcf
    }

    get LaneCountBackward() {
        return this.LaneCountBackward
    }

    set LaneCountBackward(lcb) {
        this.LaneCountBackward = lcb
    }
}

class StreetNode {
    Id
    StreetName
    IsValidForGps
    IsJunction
    IsFreeway
    IsGravelRoad
    IsBackroad
    IsOnWater
    IsPedCrossway
    TrafficlightExists
    LeftTurnNoReturn
    RightTurnNoReturn
    Position
    ConnectedNodes
    UniqueId
    Heading
    NumLanes
    NodeFlags

    constructor() {
    }

    get Id() {
        return this.Id
    }

    set Id(i) {
        this.Id = i
    }

    get StreetName() {
        return this.StreetName
    }

    set StreetName(sn) {
        this.StreetName = sn
    }

    get IsValidForGps() {
        return this.IsValidForGps
    }

    set IsValidForGps(ivfg) {
        this.IsValidForGps = ivfg
    }

    get IsJunction() {
        return this.IsJunction
    }

    set IsJunction(ij) {
        this.IsJunction = ij
    }

    get IsFreeway() {
        return this.IsFreeway
    }

    set IsFreeway(ifw) {
        this.IsFreeway = ifw
    }

    get IsGravelRoad() {
        return this.IsGravelRoad
    }

    set IsGravelRoad(igr) {
        this.IsGravelRoad = igr
    }

    get IsBackroad() {
        return this.IsBackroad
    }

    set IsBackroad(ib) {
        this.IsBackroad = ib
    }

    get IsOnWater() {
        return this.IsOnWater
    }

    set IsOnWater(iow) {
        this.IsOnWater = iow
    }

    get IsPedCrossway() {
        return this.IsPedCrossway
    }

    set IsPedCrossway(ipc) {
        this.IsPedCrossway = ipc
    }

    get TrafficlightExists() {
        return this.TrafficlightExists
    }

    set TrafficlightExists(te) {
        this.TrafficlightExists = te
    }

    get LeftTurnNoReturn() {
        return this.LeftTurnNoReturn
    }

    set LeftTurnNoReturn(ltnr) {
        this.LeftTurnNoReturn = ltnr
    }

    get RightTurnNoReturn() {
        return this.RightTurnNoReturn
    }

    set RightTurnNoReturn(rtnr) {
        this.RightTurnNoReturn = rtnr
    }

    get Position() {
        return this.Position
    }

    set Position(p) {
        this.Position = p
    }

    get ConnectedNodes() {
        return this.ConnectedNodes
    }

    set ConnectedNodes(cn) {
        this.ConnectedNodes = cn
    }

    get UniqueId() {
        return this.UniqueId
    }

    set UniqueId(ui) {
        this.UniqueId = ui
    }

    get Heading() {
        return this.Heading
    }

    set Heading(h) {
        this.Heading = h
    }

    get NumLanes() {
        return this.NumLanes
    }

    set NumLanes(nl) {
        this.NumLanes = nl
    }

    get NodeFlags() {
        return this.NodeFlags
    }

    set NodeFlags(nf) {
        this.NodeFlags = nf
    }
}

class Zone {
    ZoneName
    Min
    Max
    AreaName
    SpName
    MpName

    constructor() {
    }
}*/

/*        public class CustomVector3
                {
                    public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }

        public static explicit operator Vector3(CustomVector3 v)
        {
            return new Vector3(v.X, v.Y, v.Z);
        }
                }

        public class CustomVector4
                {
                    public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }
        public float W { get; set; }
                }*/

/*class ScenarioPoint {
    Position
    IType
    TimeStart
    TimeEnd
    ModelType
    NearScenarioPoints

    constructor() {
    }

    get Position() {
        return this.Position
    }

    set Position(p) {
        this.Position = p
    }

    get IType() {
        return this.IType
    }

    set IType(it) {
        this.IType = it
    }

    get TimeStart() {
        return this.TimeStart
    }

    set TimeStart(ts) {
        this.TimeStart = ts
    }

    get TimeEnd() {
        return this.TimeEnd
    }

    set TimeEnd(te) {
        this.TimeEnd = te
    }

    get ModelType() {
        return this.ModelType
    }

    set ModelType(mt) {
        this.ModelType = mt
    }

    get NearScenarioPoints() {
        return this.NearScenarioPoints
    }

    set NearScenarioPoints(nsp) {
        this.NearScenarioPoints = nsp
    }
}*/

class PopScheduleEntry {
    MaxAmbientPeds
    MaxScenarioPeds
    MaxCars
    MaxParkedCars
    MaxLowParkedCars
    CopsCarPercentage
    CopsPedPercentage
    MaxScenPedsStreamedUnused
    MaxScenVehiclesUnused
    MaxPreassignedParkedUnused
    PedGroupProbs
    PedGroupProbsSorted
    VehGroupProbs
    VehGroupProbsSorted
    
    constructor() {
    }

    get MaxAmbientPeds() {
        return this.MaxAmbientPeds
    }

    set MaxAmbientPeds(map) {
        this.MaxAmbientPeds = map
    }

    get MaxScenarioPeds() {
        return this.MaxScenarioPeds
    }

    set MaxScenarioPeds(msp) {
        this.MaxScenarioPeds = msp
    }

    get MaxCars() {
        return this.MaxCars
    }

    set MaxCars(mc) {
        this.MaxCars = mc
    }

    get MaxParkedCars() {
        return this.MaxParkedCars
    }

    set MaxParkedCars(mpc) {
        this.MaxParkedCars = mpc
    }

    get MaxLowParkedCars() {
        return this.MaxLowParkedCars
    }

    set MaxLowParkedCars(mlpc) {
        this.MaxLowParkedCars = mlpc
    }

    get CopsCarPercentage() {
        return this.CopsCarPercentage
    }

    set CopsCarPercentage(ccp) {
        this.CopsCarPercentage = ccp
    }

    get CopsPedPercentage() {
        return this.CopsPedPercentage
    }

    set CopsPedPercentage(cpp) {
        this.CopsPedPercentage = cpp
    }

    get MaxScenPedsStreamedUnused() {
        return this.MaxScenPedsStreamedUnused
    }

    set MaxScenPedsStreamedUnused(mcpsu) {
        this.MaxScenPedsStreamedUnused = mcpsu
    }

    get MaxScenVehiclesUnused() {
        return this.MaxScenVehiclesUnused
    }

    set MaxScenVehiclesUnused(msvu) {
        this.MaxScenVehiclesUnused = msvu
    }

    get MaxPreassignedParkedUnused() {
        return this.MaxPreassignedParkedUnused
    }

    set MaxPreassignedParkedUnused(mppu) {
        this.MaxPreassignedParkedUnused = mppu
    }

    get PedGroupProbs() {
        return this.PedGroupProbs
    }

    set PedGroupProbs(pgp) {
        this.PedGroupProbs = pgp
    }

    get PedGroupProbsSorted() {
        return this.PedGroupProbsSorted
    }

    set PedGroupProbsSorted(pgps) {
        this.PedGroupProbsSorted = pgps
    }

    get VehGroupProbs() {
        return this.VehGroupProbs
    }

    set VehGroupProbs(vgp) {
        this.VehGroupProbs = vgp
    }

    get VehGroupProbsSorted() {
        return this.VehGroupProbsSorted
    }

    set VehGroupProbsSorted(vgps) {
        this.VehGroupProbsSorted = vgps
    }
    
}

class PopSchedule {
    Entries = []
    
    constructor() {
        for(let i = 0; i < 12; i++) {
            this.Entries.push(new PopScheduleEntry())
        }
    }
}

class CarGenerator {
    Position
    OrientX
    OrientY
    Model
    PopGroup
    
    constructor(Position, Model, PopGroup, OrientX, OrientY) {
        this.Position = Position
        this.Model = Model
        this.PopGroup = PopGroup
        this.OrientX = OrientX
        this.OrientY = OrientY
    }

    get Position() {
        return this.Position
    }

    set Position(p) {
        this.Position = p
    }

    get OrientX() {
        return this.OrientX
    }

    set OrientX(ox) {
        this.OrientX = ox
    }

    get OrientY() {
        return this.OrientY
    }

    set OrientY(oy) {
        this.OrientY = oy
    }

    get Model() {
        return this.Model
    }

    set Model(m) {
        this.Model = m
    }

    get PopGroup() {
        return this.PopGroup
    }

    set PopGroup(p) {
        this.PopGroup = p
    }
}

export class LiveCityDataService {
        streetNodes
        vehicleNodes = new Map()
        #vehicleNodesGrid = new Map()

        #waterNodes = new Map()

        #allowedScenarios 
        #scenarioMap = new Map()

        #carGenerators = new Map()
        #carGeneratorsGrid = new Map()

        #zones = new Map()

        #carModels 
        #colorlessCars = []
        #carColorsNum 

        #carGenProhibitedModels = new Map()
        #ambientCarProhibitedModels = new Map()

        #randomProvider
        #navigationMeshProvider

        PedComponentVariations

        PedGroups = new Map()
        VehGroups = new Map()
        PedModelGroups = new Map()
        ZoneSchedules = new Map()
        ScenarioPoints = new Map()

        ClockHoursByPlayer = new Map()

        #numberPlateChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

        statsTest = []
        statsTest2 = []

        constructor()
        {
            if (!globalConfig.EnableNavigationDataLoad) return

            this.#randomProvider = new RandomProvider
            this.#navigationMeshProvider = new NavigationMeshProvider

            
        }
    
    async loadLiveCityDataService () {
            if (!globalConfig.EnableNavigationDataLoad) return
        
            await this.#navigationMeshProvider.loadNavigationMeshProvider()
            
            await this.#ParseZones()
            await this.#LoadPopCycles()
            await this.#LoadPopGroups()
            await this.#LoadCarGenerators()
            this.#LoadCarGenProhibitedModels()
            this.#LoadCarData()
            this.#LoadScenarioPoints()
            this.#LoadStreetNodes()
            this.#LoadPedComponentVariations()
        }

        #LoadStreetNodes() {
            this.streetNodes = StreetNodes
            for (let i = 0; i < this.streetNodes.length; i++) {
                const streetNode = this.streetNodes[i]
                if (!streetNode.IsPedCrossway && !streetNode.IsOnWater && streetNode.StreetName !== "0" && !streetNode.IsBackroad) {
                    this.vehicleNodes.set(streetNode.Id, streetNode)
                    const x = Math.floor(streetNode.Position.X / 100)
                    const y = Math.floor(streetNode.Position.Y / 100)
                    const key = new CellCoord(x, y).toString()
                    if (!this.#vehicleNodesGrid.has(key)) {
                        this.#vehicleNodesGrid.set(key, [])
                    }
                    this.#vehicleNodesGrid.get(key).push(streetNode)
                } else if (streetNode.IsOnWater) {
                    this.#waterNodes.set(streetNode.Id, streetNode)
                }
            }
            
            alt.log("Successfully loaded dump file ExtendedNodes.json.", this.vehicleNodes.size, this.#vehicleNodesGrid.size, this.#waterNodes.size)
        }

        #LoadPedComponentVariations() {
            this.PedComponentVariations = PedComponentVariations
            
            alt.log("Successfully loaded dump file pedComponentVariations.json.", Object.keys(this.PedComponentVariations).length)
        }

        #LoadCarGenProhibitedModels() {
            const allVehicles = vehicles
            for (let i = 0; i < allVehicles.length; i++) {
                const vehicle = allVehicles[i]
                if (Array.isArray(vehicle.Flags) && vehicle.Flags.includes("FLAG_DONT_SPAWN_IN_CARGEN")) {
                    this.#carGenProhibitedModels.set(vehicle.Hash, vehicle.Name.toLowerCase())
                }

                if (Array.isArray(vehicle.Flags) && vehicle.Flags.includes("FLAG_DONT_SPAWN_AS_AMBIENT")) {
                    this.#ambientCarProhibitedModels.set(vehicle.Hash, vehicle.Name.toLowerCase());
                }
            }
            
            alt.log("Successfully loaded dump file vehicles.json.", this.#carGenProhibitedModels.size, this.#ambientCarProhibitedModels.size)
        }

        async #LoadCarGenerators() {
            const data = await readFile('./resources/livecity-js/server/data/LiveCity/CarGenerators.xml')

                const result = await xmlJs.xml2js(data, {compact: true, nativeType: true, ignoreAttributes: true })

                const cargeneratorElements = result.ArrayOfCarGenerator.CarGenerator

                for (let i = 0; i < cargeneratorElements.length; i++) {
                    const cElement = cargeneratorElements[i]
                    this.#carGenerators.set(i, new CarGenerator(
                        new alt.Vector3(cElement.Position.X._text, cElement.Position.Y._text, cElement.Position.Z._text),
                        cElement.Model._text,
                        cElement.PopGroup._text,
                        cElement.OrientX._text,
                        cElement.OrientY._text
                        ))
                }

                this.#carGenerators.forEach((carGenerator, key) => {
                    const x = Math.floor(carGenerator.Position.x / 100)
                    const y = Math.floor(carGenerator.Position.y / 100)
                    const k = new CellCoord(x, y).toString()

                    if (!this.#carGeneratorsGrid.has(k)) {
                        this.#carGeneratorsGrid.set(k, [])
                    }
                    this.#carGeneratorsGrid.get(k).push(carGenerator)
                })
                
            alt.log("Successfully loaded dump file CarGenerators.xml.", this.#carGenerators.size, this.#carGeneratorsGrid.size)
        }

        GenerateNumberPlate() {
            let numberplate = ""

            for (let i = 0; i < 8; i++) {
                numberplate += this.#randomProvider.choice(this.#numberPlateChars);
            }

            return numberplate
        }

        async #ParseZones() {
            const zoneBindings = new Map()
            const data = await readFile('./resources/livecity-js/server/data/LiveCity/ZoneBind.ymt')
                
            const result = await xmlJs.xml2js(data, {compact: true, nativeType: true, ignoreAttributes: true })
            
            const zonesItems = result.collision_03ba8d5a_9vr968c.zones.Item
            
            for (let i = 0; i < zonesItems.length; i++) {
                const zElement = zonesItems[i]
                const zoneName = zElement.zoneName._text.toLowerCase()
                const spName = zElement.spName._text.toLowerCase()
                const mpName = zElement.mpName._text.toLowerCase()
                zoneBindings.set(zoneName, [spName, mpName])
            }
            
            alt.log("Successfully loaded dump file ZoneBind.ymt.", zoneBindings.size)
            
            const data2 = await readFile('./resources/livecity-js/server/data/LiveCity/Zones.txt')
    
            const rl = data2.toString().split('\n')
            
            for (let i = 0; i < rl.length; i++) {
                const zone = {}
                const splitted = rl[i].split(',')
                zone.ZoneName = splitted[0].toLowerCase()
                zone.Min = new alt.Vector3(parseFloat(splitted[1]), parseFloat(splitted[2]), parseFloat(splitted[3]))
                zone.Max = new alt.Vector3(parseFloat(splitted[4]), parseFloat(splitted[5]), parseFloat(splitted[6]))
                zone.AreaName = splitted[7].toLowerCase()
                zone.SpName = zoneBindings.get(zone.ZoneName)[0].toLowerCase()
                zone.MpName = zoneBindings.get(zone.ZoneName)[1].toLowerCase()
                
                this.#zones.set(zone.ZoneName, zone) 
            }
            
            alt.log("Successfully loaded dump file Zones.txt.", this.#zones.size)
        }

        async #LoadPopCycles() {
            const data = await readFile('./resources/livecity-js/server/data/LiveCity/PopCycle')

            const rl = data.toString().split('\n')
            
            let schedule = new PopSchedule()
            let currentTimeIndex = 0
            let currentZone = ""
            
            for (let i = 0; i < rl.length; i++) {
                const s = rl[i]
                if (s.startsWith("//") || s.length === 0) continue
                
                if (s.startsWith("POP_SCHEDULE:")) {
                    schedule = new PopSchedule()
                } else if (s.startsWith("      ")) {
                    const scheduleSplitted = s.split(' ').filter(Boolean)
                    const entry = new PopScheduleEntry()
                    entry.MaxAmbientPeds = parseInt(scheduleSplitted[0])
                    entry.MaxScenarioPeds = parseInt(scheduleSplitted[1])
                    entry.MaxCars = parseInt(scheduleSplitted[2])
                    entry.MaxParkedCars = parseInt(scheduleSplitted[3])
                    entry.MaxLowParkedCars = parseInt(scheduleSplitted[4])
                    entry.CopsCarPercentage = parseInt(scheduleSplitted[5]) * 0.01
                    entry.CopsPedPercentage = parseInt(scheduleSplitted[6]) * 0.01
                    //unused 7 8 9
                    entry.PedGroupProbs = new Map()
                    entry.VehGroupProbs = new Map()
                    let pedsMode = true;
                    let currentGroup = "";
                    for (let i = 10; i < scheduleSplitted.length; i++) {
                        if (scheduleSplitted[i] === "peds") continue

                        if (scheduleSplitted[i] === "cars") {
                            pedsMode = false
                        } else {
                            const probability = parseInt(scheduleSplitted[i])
                            if (!isNaN(probability)) {
                                const prob = probability * 0.01
                                if (pedsMode) {
                                    entry.PedGroupProbs.set(currentGroup, prob)
                                } else {
                                    entry.VehGroupProbs.set(currentGroup, prob)
                                }
                            } else {
                                currentGroup = scheduleSplitted[i].trim().toLowerCase()
                            }
                        }
                    }

                    schedule.Entries[currentTimeIndex] = entry

                    // Sort data for probability in future
                    entry.VehGroupProbsSorted = [...entry.VehGroupProbs.entries()].sort((a, b) => a[1] - b[1])
                    
                    entry.PedGroupProbsSorted = [...entry.PedGroupProbs.entries()].sort((a, b) => a[1] - b[1])
                    
                    currentTimeIndex++;
                } else if (s.startsWith("END_POP_SCHEDULE")) {
                    this.ZoneSchedules.set(currentZone, schedule)
                    currentTimeIndex = 0;
                } else if (s.length > 0) {
                    currentZone = s.trim().toLowerCase()
                }
            }
            
            alt.log("Successfully loaded dump file PopCycle.", this.ZoneSchedules.size)
        }

        async #LoadPopGroups() {
            const data = await readFile('./resources/livecity-js/server/data/LiveCity/PopGroups.xml')

            const result = await xmlJs.xml2js(data, {compact: true, nativeType: true, ignoreAttributes: true })
    
            const pedGroupElements = result.CPopGroupList.pedGroups.Item
    
            for (let i = 0; i < pedGroupElements.length; i++) {
                const pElement = pedGroupElements[i]
                const groupName = pElement.Name._text.toLowerCase()
    
                const models = new Map()
                const modelElementsItem = pElement.models.Item
                if (Array.isArray(modelElementsItem)) {
                    for (let j = 0; j < modelElementsItem.length; j++) {
                        models.set(j, modelElementsItem[j].Name._text.toLowerCase())
                    }
                } else {
                    models.set(0, modelElementsItem.Name._text.toLowerCase())
                }
    
                this.PedGroups.set(groupName, models)
            }
            
            const vehGroupElements = result.CPopGroupList.vehGroups.Item
    
            for (let i = 0; i < vehGroupElements.length; i++) {
                const vElement = vehGroupElements[i]
                const groupName = vElement.Name._text.toLowerCase()
    
                const models = new Map()
                const modelElementsItem = vElement.models.Item
                if (Array.isArray(modelElementsItem)) {
                    for (let j = 0; j < modelElementsItem.length; j++) {
                        models.set(j, modelElementsItem[j].Name._text.toLowerCase())
                    }
                } else {
                    models.set(0, modelElementsItem.Name._text.toLowerCase())
                }
                
                //if (groupName === 'veh_transport_mp') alt.logDebug('models', models, 'modelElementsItem', modelElementsItem, 'modelElements.length', modelElementsItem.length)
                
                this.VehGroups.set(groupName, models)
            }

            alt.log("Successfully loaded dump file PopGroups.xml.", this.PedGroups.size, this.VehGroups.size)
        }

        #LoadScenarioPoints() {
            const allScenarioPoints = ScenarioPoints
            this.#allowedScenarios = AllowedScenarios
            
            for (let key in PedModelGroup) {
                if (PedModelGroup.hasOwnProperty(key)) {
                    const value = PedModelGroup[key]
                    this.PedModelGroups.set(key.toLowerCase(), value)
                }
            }
            
            for (let i = 0; i < allScenarioPoints.length; i++) {
                const scenarioPoint = allScenarioPoints[i]
                if (this.#allowedScenarios.includes(scenarioPoint.IType)) {
                    this.ScenarioPoints.set(scenarioPoint.IType, scenarioPoint)

                    const cellX = Math.floor(scenarioPoint.Position.X / 100)
                    const cellY = Math.floor(scenarioPoint.Position.Y / 100)

                    const key = new CellCoord(cellX, cellY).toString()

                    if (!this.#scenarioMap.has(key)) {
                        this.#scenarioMap.set(key, [])
                    }
                    this.#scenarioMap.get(key).push(scenarioPoint)
                }
            }

            alt.log("Successfully loaded dump file ScenarioPoints.json, AllowedScenarios.json and PedModelGroup.json.", allScenarioPoints.length, this.#allowedScenarios.length, this.PedModelGroups.size, this.ScenarioPoints.size, this.#scenarioMap.size)

            // From pedsync repo - search adjacent scenario points. Probably related to each other
            //foreach (ScenarioPoint scenarioPoint2 in ScenarioPoints)
            //{
            //	int cellX = (int)Math.Ceiling(scenarioPoint2.Position.X / 10),
            //		cellY = (int)Math.Ceiling(scenarioPoint2.Position.Y / 10);

            //	scenarioPoint2.NearScenarioPoints = new List<ScenarioPoint>();

            //	//if (
            //	//	!m_scenarioMap.ContainsKey((cellX, cellY)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX, cellY - 1)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX, cellY + 1)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX - 1, cellY)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX - 1, cellY - 1)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX - 1, cellY + 1)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX + 1, cellY)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX + 1, cellY - 1)) &&
            //	//	!m_scenarioMap.ContainsKey((cellX + 1, cellY + 1))
            //	//) continue;

            //	//for (int i = -1; i < 2; i++)
            //	//{
            //	//	for (int j = -1; j < 2; j++)
            //	//	{
            //	//		//Check if zone exists
            //	//		if (m_scenarioMap.ContainsKey((cellX + i, cellY + j)))
            //	//		{
            //	//			foreach (ScenarioPoint scenarioPoint3 in m_scenarioMap[(cellX + i, cellY + j)])
            //	//			{
            //	//				double distance = Vector3.Distance(
            //	//					new Vector3(scenarioPoint2.Position.X, scenarioPoint2.Position.Y,
            //	//						scenarioPoint2.Position.Z),
            //	//					new Vector3(scenarioPoint3.Position.X, scenarioPoint3.Position.Y,
            //	//						scenarioPoint3.Position.Z));

            //	//				if (distance is < 3 and > 1 && scenarioPoint2.TimeStart == scenarioPoint3.TimeStart)
            //	//				{
            //	//					scenarioPoint2.NearScenarioPoints.Add(scenarioPoint3);
            //	//				}
            //	//			}
            //	//		}
            //	//	}
            //	//}
            //}
        }

        #LoadCarData() {
            this.#carModels = CarModels
            const colorlessCars = ColorlessCars            
            for (let i = 0; i < colorlessCars.length; i++) {
                const car = colorlessCars[i]
                this.#colorlessCars.push(alt.hash(car));
            }
            this.#carColorsNum = CarColorsNum
            
            alt.log("Successfully loaded dump file CarModels.json, ColorlessCars.json and CarColorsNum.json.", this.#carModels.length, this.#colorlessCars.length, this.#carColorsNum.length)
        }

        GetZoneByPosition(position) {
            for (let [key, zone] of this.#zones) {
                if (zone.Min.x > zone.Max.x) {
                    zone.Min = new alt.Vector3(zone.Max.x, zone.Min.y, zone.Min.z)
                    zone.Max = new alt.Vector3(zone.Min.x, zone.Max.y, zone.Max.z)
                }

                if (zone.Min.y > zone.Max.y) {
                    zone.Min = new alt.Vector3(zone.Min.x, zone.Max.y, zone.Min.z)
                    zone.Max = new alt.Vector3(zone.Max.x, zone.Min.y, zone.Max.z)
                }

                if (zone.Min.z > zone.Max.z) {
                    zone.Min = new alt.Vector3(zone.Min.x, zone.Min.y, zone.Max.z)
                    zone.Max = new alt.Vector3(zone.Max.x, zone.Max.y, zone.Min.z)
                }

                if (zone.Min.x <= position.x
					&& position.x <= zone.Max.x
					&& zone.Min.y <= position.y
					&& position.y <= zone.Max.y) {
                    return zone
                }
            }

            return null
        }

        //internal record StreetNodeOption(StreetNode Node, StreetNodeConnected ConnectedNode);
        GetRandomStreetNodeInRange(position, range, minRange = 0.0) {
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100

            const tlx = position.x - range
            const tly = position.y - range

            const brx = position.x + range
            const bry = position.y + range

            const options = []

            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#vehicleNodesGrid.has(coord)) {
                        const value = this.#vehicleNodesGrid.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const point = value[k]
                            const pos2d = new alt.Vector3(point.Position.X, point.Position.Y, 0);
                            const distance = pos2d.distanceTo(position)

                            if (distance < range && distance > minRange) {
                                for (let l = 0; l < point.ConnectedNodes.length; l++) {
                                    const streetNodeConnected = point.ConnectedNodes[l]
                                    if (streetNodeConnected.LaneCountForward !== 0) options.push([point, streetNodeConnected])
                                }
                            }
                        }
                    }
                }
            }

            if (options.length === 0) return null

            return this.#randomProvider.choice(options)
        }

        IsPointInsideSector(origin, point, direction, angleDegrees, range) {
            let angle = Math.atan2(vector3Length(point.sub(origin).cross(direction)), point.sub(origin).dot(direction))
            angle = Math.abs(angle)

            const radiusSquared = range * range
            return angle <= toRadians(angleDegrees) && point.distanceToSquared(origin) < radiusSquared
        }

        GetRandomStreetNodeInSector(position, direction, angleDegrees, range, minRange) {
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100

            const tlx = position.x - range
            const tly = position.y - range

            const brx = position.x + range
            const bry = position.y + range

            const options = []

            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#vehicleNodesGrid.has(coord)) {
                        const value = this.#vehicleNodesGrid.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const point = value[k]
                            const pos2d = new alt.Vector3(point.Position.X, point.Position.Y, 0);
                            const distance = pos2d.distanceTo(position)
                            
                            if (this.IsPointInsideSector(position, pos2d, direction, angleDegrees, range)) {
                                if (distance > minRange) {
                                    for (let l = 0; l < point.ConnectedNodes.length; l++) {
                                        const streetNodeConnected = point.ConnectedNodes[l]
                                        if (streetNodeConnected.LaneCountForward !== 0) options.push([point, streetNodeConnected])
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (options.length === 0) return null

            return this.#randomProvider.choice(options)
        }

        GetRandomScenarioPointInRange(position, range, minRange = 0.0) {
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100

            const tlx = position.x - range
            const tly = position.y - range

            const brx = position.x + range
            const bry = position.y + range

            const options = []

            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#scenarioMap.has(coord)) {
                        const value = this.#scenarioMap.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const point = value[k]
                            const pos2d = new alt.Vector3(point.Position.X, point.Position.Y, 0);
                            const distance = pos2d.distanceTo(position)

                            if (distance < range && distance > minRange) {
                                    options.push(point)
                            }
                        }
                    }
                }
            }

            if (options.length === 0) return null

            return this.#randomProvider.choice(options)
        }

        GetRandomScenarioPointInSector(position, direction, angleDegrees, range, minRange = 0.0) {
                position = new alt.Vector3(position.x, position.y, 0.0)
                const cellSize = 100
        
                const tlx = position.x - range
                const tly = position.y - range
        
                const brx = position.x + range
                const bry = position.y + range
        
                const options = []
        
                for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                    for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                        const coord = new CellCoord(i, j).toString()
                        if (this.#scenarioMap.has(coord)) {
                            const value = this.#scenarioMap.get(coord)
                            for (let k = 0; k < value.length; k++) {
                                const point = value[k]
                                const pos2d = new alt.Vector3(point.Position.X, point.Position.Y, 0);
                                const distance = pos2d.distanceTo(position)
                                
                                if (this.IsPointInsideSector(position, pos2d, direction, angleDegrees, range)) {
                                    if (distance > minRange) {
                                        options.push(point)
                                    }
                                }
                            }
                        }
                    }
                }
        
                if (options.length === 0) return null
        
                return this.#randomProvider.choice(options)
            }
        
        GetRandomPedModelByPosition(position, playerId) {
            const zone = this.GetZoneByPosition(position)
            if (zone === null) {
                // Fallback for positions which are not inside any zone. like 1368.424 -881.748 13.843
                return alt.hash('A_M_Y_Downtown_01')
            }
    
            const schedule = this.ZoneSchedules.get(zone.MpName)
            let entryIndex = 7
            if (this.ClockHoursByPlayer.has(playerId)) {
                entryIndex = this.ClockHoursByPlayer.get(playerId) === 0 ? 0 : Math.floor(this.ClockHoursByPlayer.get(playerId) / 2)
            }
            // TODO: choose based on time manager. Taking 12-14 for now
            const chosenScheduleEntry = schedule.Entries[entryIndex]
            
            const prob = this.#randomProvider.getFloat()
            let accumulatedProb = 0.0;
        
            let chosenGroup = chosenScheduleEntry.PedGroupProbsSorted[0][0]
            for (let i = 0; i < chosenScheduleEntry.PedGroupProbsSorted.length; ++i) {
                accumulatedProb += chosenScheduleEntry.PedGroupProbsSorted[i][1]
                
                if (prob < accumulatedProb) {
                    chosenGroup = chosenScheduleEntry.PedGroupProbsSorted[i][0];
                    break
                }
            }
            
            const chosenModel = this.#randomProvider.getRandomItem(this.PedGroups.get(chosenGroup))
            
            if (chosenModel === undefined) alt.logDebug('chosenGroup', chosenGroup, 'this.PedGroups.get(chosenGroup)', this.PedGroups.get(chosenGroup), 'this.PedGroups.has(chosenGroup)', this.PedGroups.has(chosenGroup), this.PedGroups.get(chosenGroup).get(0), this.PedGroups.get(chosenGroup).has(0))
            
            return alt.hash(chosenModel)
        }

        GetRandomVehicleModelByPosition(position, excludeProhibitedAmbient, excludeProhibitedCarGen, playerId) {
            const zone = this.GetZoneByPosition(position)
            if (zone === null) {
                // Fallback for positions which are not inside any zone. like 1368.424 -881.748 13.843
                return alt.hash('asea')
            }
            
            const schedule = this.ZoneSchedules.get(zone.MpName)
            let entryIndex = 7
            if (this.ClockHoursByPlayer.has(playerId)) {
                entryIndex = this.ClockHoursByPlayer.get(playerId) === 0 ? 0 : Math.floor(this.ClockHoursByPlayer.get(playerId) / 2)
            }
            // TODO: choose based on time manager. Taking 12-14 for now
            const chosenScheduleEntry = schedule.Entries[entryIndex]

            const prob = this.#randomProvider.getFloat()
            let accumulatedProb = 0.0;

            let chosenGroup = chosenScheduleEntry.VehGroupProbsSorted[0][0]
            for (let i = 0; i < chosenScheduleEntry.VehGroupProbsSorted.length; ++i) {
                accumulatedProb += chosenScheduleEntry.VehGroupProbsSorted[i][1]
                
                if (prob < accumulatedProb) {
                    chosenGroup = chosenScheduleEntry.VehGroupProbsSorted[i][0]
                    break
                }
            }

            let chosenModel = this.#randomProvider.getRandomItem(this.VehGroups.get(chosenGroup))
            
            if (chosenModel === undefined) alt.logDebug('chosenGroup', chosenGroup, 'this.VehGroups.get(chosenGroup)', this.VehGroups.get(chosenGroup), 'this.VehGroups.has(chosenGroup)', this.VehGroups.has(chosenGroup), this.VehGroups.get(chosenGroup).get(0), this.VehGroups.get(chosenGroup).has(0))
            
            if (chosenModel === 'asea') return alt.hash('asea')
            
            if (excludeProhibitedCarGen) {
                if ([...this.#carGenProhibitedModels.values()].includes(chosenModel)) {
                    return alt.hash('asea')
                }
            }

            if (excludeProhibitedAmbient) {
                if ([...this.#ambientCarProhibitedModels.values()].includes(chosenModel))
                {
                    return alt.hash('asea')
                }
            }
            
            // Quick fix for boats
            // TODO: Proper searching for spawn nodes for boats
            const info = alt.getVehicleModelInfoByHash(alt.hash(chosenModel))
            if (info.type === 14) {
                return alt.hash('asea')
            }
            
            return alt.hash(chosenModel)
        }

        GetRandomCarColor(vehicleModelHash) {
            if (!this.#colorlessCars.includes(vehicleModelHash)) {
                if (this.#carColorsNum.length !== 0) {
                    const color1 = this.#randomProvider.choice(this.#carColorsNum)
                    const color2 = this.#randomProvider.choice(this.#carColorsNum)
                    return [color1, color2]
                }
            }

            return [0, 0]
        }

        GetRandomCarGenInRange(position, range, minRange = 0.0) {
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100

            const tlx = position.x - range
            const tly = position.y - range

            const brx = position.x + range
            const bry = position.y + range

            const options = []

            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#carGeneratorsGrid.has(coord)) {
                        const value = this.#carGeneratorsGrid.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const point = value[k]
                            const pos2d = new alt.Vector3(point.Position.x, point.Position.y, 0);
                            const distance = pos2d.distanceTo(position)

                            if (distance < range && distance > minRange) {
                                    options.push(point)
                            }
                        }
                    }
                }
            }

            if (options.length === 0) return null

            return this.#randomProvider.choice(options)
        }

        GetRandomCarGenInSector(position, direction, angleDegrees, range, minRange) {
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100
    
            const tlx = position.x - range
            const tly = position.y - range
    
            const brx = position.x + range
            const bry = position.y + range
    
            const options = []
    
            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#carGeneratorsGrid.has(coord)) {
                        const value = this.#carGeneratorsGrid.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const point = value[k]
                            const pos2d = new alt.Vector3(point.Position.x, point.Position.y, 0);
                            const distance = pos2d.distanceTo(position)
    
                            if (this.IsPointInsideSector(position, pos2d, direction, angleDegrees, range)) {
                                if (distance > minRange) {
                                    options.push(point)
                                }
                            }
                        }
                    }
                }
            }
    
            if (options.length === 0) return null
    
            return this.#randomProvider.choice(options)
        }

        GetRandomFootpathPointInRange(position, range, minRange = 0.0) {
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100

            const tlx = position.x - range
            const tly = position.y - range

            const brx = position.x + range
            const bry = position.y + range

            const options = []

            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#navigationMeshProvider.FootpathPolygons.has(coord)) {
                        const value = this.#navigationMeshProvider.FootpathPolygons.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const polyFootpath = value[k]
                            options.push(polyFootpath)
                        }
                    }
                }
            }

            if (options.length === 0) return null

            let selectedPolygon = this.#randomProvider.choice(options)
            
            while (selectedPolygon.Vertices.length <= 2){
                selectedPolygon = this.#randomProvider.choice(options);
            }

            // TODO: select random triangle, not only 0-2 vertices
            const outPosition = this.#navigationMeshProvider.GetRandomPositionInsideTriangle(
                new alt.Vector3(selectedPolygon.Vertices[0]),
                new alt.Vector3(selectedPolygon.Vertices[1]),
                new alt.Vector3(selectedPolygon.Vertices[2]))

            const distSq = outPosition.distanceToSquared(position)
            if (distSq > range * range || distSq < minRange * minRange) return null

            return outPosition
        }

    GetRandomFootpathPointInSector(position, direction, angleDegrees, range, minRange = 0.0) {
            const n = Date.now()
            position = new alt.Vector3(position.x, position.y, 0.0)
            const cellSize = 100

            const tlx = position.x - range
            const tly = position.y - range

            const brx = position.x + range
            const bry = position.y + range

            const options = new Map()
            
            outer:
            for (let i = Math.floor(tlx / cellSize); i < Math.floor(brx / cellSize) + 1; ++i) {
                for (let j = Math.floor(tly / cellSize); j < Math.floor(bry / cellSize) + 1; ++j) {
                    const coord = new CellCoord(i, j).toString()
                    if (this.#navigationMeshProvider.FootpathPolygons.has(coord)) {
                        const value = this.#navigationMeshProvider.FootpathPolygons.get(coord)
                        for (let k = 0; k < value.length; k++) {
                            const polyFootpath = value[k]
                            try {
                                if (polyFootpath.Vertices[0] && polyFootpath.Vertices[1] && polyFootpath.Vertices[2]) {
                                    const center = this.#navigationMeshProvider.GetCenterPositionOfTriangle(new alt.Vector3(polyFootpath.Vertices[0]), new alt.Vector3(polyFootpath.Vertices[1]), new alt.Vector3(polyFootpath.Vertices[2]))

                                    const pos2d = new alt.Vector3(center.x, center.y, 0)
                                    if (this.IsPointInsideSector(position, pos2d, direction, angleDegrees, range)){
                                        options.set(polyFootpath, polyFootpath)
                                    }
                                    if (Date.now() - n >= 48) break outer
                                } else break outer
                            } catch (e) {
                                alt.logError(e)
                                alt.log(polyFootpath.Vertices[0], polyFootpath.Vertices[1], polyFootpath.Vertices[2])
                            }
                        }
                    }
                }
            }
            
            if (globalConfig.DebugStats) {
                this.statsTest.push(Date.now() - n)
    
                this.statsTest2.push(options.size)
            }

            if (options.size === 0) return null

            let selectedPolygon = this.#randomProvider.getRandomItem(options)

            while (selectedPolygon.Vertices.length <= 2){
                selectedPolygon = this.#randomProvider.getRandomItem(options)
            }

            // TODO: select random triangle, not only 0-2 vertices
            const outPosition = this.#navigationMeshProvider.GetRandomPositionInsideTriangle(
                new alt.Vector3(selectedPolygon.Vertices[0]),
                new alt.Vector3(selectedPolygon.Vertices[1]),
                new alt.Vector3(selectedPolygon.Vertices[2]))

            const distSq = outPosition.distanceToSquared(position)
            if (distSq > range * range || distSq < minRange * minRange) return null

            return outPosition
        }
}
