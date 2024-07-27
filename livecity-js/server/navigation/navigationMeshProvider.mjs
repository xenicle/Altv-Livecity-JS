import alt from 'alt-server'

import { RandomProvider } from "../../shared/randomProvider.mjs"

import { readFile } from 'fs/promises'
import msgpack from 'msgpack5'

const decode = msgpack().decode

export class CellCoord {
    x
    y

    constructor(x, y) {
        this.x = x
        this.y = y
    }

    get x() {
        return this.x
    }

    set x(x) {
        this.x = x
    }

    get y() {
        return this.y
    }

    set y(y) {
        this.y = y
    }
    
    toString() {
        return 'CellCoord[' + this.x + ', ' + this.y + ']'
    }
}

/*namespace LiveCity.Server.Navigation
{
    [MessagePackObject]
    public class NavigationMesh
        {
            [Key(0)] public int AreaId { get; set; }

    [Key(1)] public int CellX { get; set; }

    [Key(2)] public int CellY { get; set; }

    [Key(3)] public List<NavigationMeshPoly> Polygons { get; set; }
        }

    [MessagePackObject]
    public class NavigationMeshPoly
        {
            [Key(0)] public int Index { get; set; }

    [Key(1)] public int PartId { get; set; }

    [Key(2)] public bool IsFootpath { get; set; }

    [Key(3)] public bool IsUnderground { get; set; }

    [Key(4)] public bool IsSteepSlope { get; set; }

    [Key(5)] public bool IsWater { get; set; }

    [Key(6)] public bool HasPathNode { get; set; }

    [Key(7)] public bool IsInterior { get; set; }

    [Key(8)] public bool IsFlatGround { get; set; }

    [Key(9)] public bool IsRoad { get; set; }

    [Key(10)] public bool IsCellEdge { get; set; }

    [Key(11)] public bool IsTrainTrack { get; set; }

    [Key(12)] public bool IsShallowWater { get; set; }

    [Key(13)] public bool IsFootpathUnk1 { get; set; }

    [Key(14)] public bool IsFootpathUnk2 { get; set; }

    [Key(15)] public bool IsFootpathMall { get; set; }

    [Key(16)] public bool IsSlopeSouth { get; set; }

    [Key(17)] public bool IsSlopeSouthEast { get; set; }

    [Key(18)] public bool IsSlopeEast { get; set; }

    [Key(19)] public bool IsSlopeNorthEast { get; set; }

    [Key(20)] public bool IsSlopeNorth { get; set; }

    [Key(21)] public bool IsSlopeNorthWest { get; set; }

    [Key(22)] public bool IsSlopeWest { get; set; }

    [Key(23)] public bool IsSlopeSouthWest { get; set; }

    [Key(24)] public int UnkX { get; set; }

    [Key(25)] public int UnkY { get; set; }

    [Key(26)] public WorldVector3 Position { get; set; }

    [Key(27)] public List<WorldVector3> Vertices { get; set; }

    [Key(28)] public List<NavigationMeshPolyEdge> Edges { get; set; }
        }

    [MessagePackObject]
    public class NavigationMeshPolyEdge
        {
            [Key(0)] public uint AreaId { get; set; }

    [Key(1)] public uint PolyIndex { get; set; }
        }

    [MessagePackObject]
    public class WorldVector3
        {
            [Key(0)] public float X { get; set; }

    [Key(1)] public float Y { get; set; }

    [Key(2)] public float Z { get; set; }

    public static explicit operator Vector3(WorldVector3 v)
    {
        return new Vector3(v.X, v.Y, v.Z);
    }
        }*/

class NavigationMeshPolyFootpath {
    Index
    AreaId
    CellX
    CellY
    Vertices = []
    constructor(footPahArray) {
        this.Index = footPahArray[0]
        this.AreaId = footPahArray[1]
        this.CellX = footPahArray[2]
        this.CellY = footPahArray[3]
        this.Vertices = footPahArray[4]
    }
    
    get Index() {
        return this.Index
    }
    
    set Index(i) {
        this.Index = i
    }

    get AreaId() {
        return this.AreaId
    }

    set AreaId(ai) {
        this.AreaId = ai
    }

    get CellX() {
        return this.CellX
    }

    set CellX(cx) {
        this.CellX = cx
    }

    get CellY() {
        return this.CellY
    }

    set CellY(cy) {
        this.CellY = cy
    }

    get Vertices() {
        return this.Vertices
    }

    set Vertices(v) {
        this.Vertices = v
    }
}

export class NavigationMeshProvider  {
    #randomProvider = new RandomProvider()
    FootpathPolygons = new Map()

    GetRandomPositionInsideTriangle(a, b, c) {
        const r1 = this.#randomProvider.getFloat()
        const r2 = this.#randomProvider.getFloat()

        return a.mul(1.0 - Math.sqrt(r1)).add(b.mul(Math.sqrt(r1) * (1.0 - r2))).add(c.mul(Math.sqrt(r1) * r2))
    }
    
    GetCenterPositionOfTriangle(a, b, c) {
        const x = (a.x + b.x + c.x) / 3
        const y = (a.y + b.y + c.y) / 3
        const z = (a.z + b.z + c.z) / 3
        
        return new alt.Vector3(x, y, z)
    }
    
    constructor () {
        
    }

    async loadNavigationMeshProvider() {
            //ExtractFootpathFromNavMesh();
        //	return;
        const data = await readFile('./resources/livecity-js/server/data/footpath.msgpack')

        const allFootpaths = await decode(data)

        for (let i = 0; i < allFootpaths.length; i++) {
            const navigationMeshPolyFootpath = new NavigationMeshPolyFootpath(allFootpaths[i])

            const key = new CellCoord(navigationMeshPolyFootpath.CellX, navigationMeshPolyFootpath.CellY).toString()

            if (!this.FootpathPolygons.has(key)) {
                this.FootpathPolygons.set(key, [])
            }

            this.FootpathPolygons.get(key).push(navigationMeshPolyFootpath)
        }

        alt.log("Successfully loaded dump file footpath.msgpack.", allFootpaths.length, this.FootpathPolygons.size)
    }
}
