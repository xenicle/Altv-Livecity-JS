
class LiveCityConfig {

  ParkedVehiclesBudget = 12
  WanderVehiclesBudget = 18
  WanderPedsBudget = 16
  ScenarioPedsBudget = 6
  
  EntityBudget = 100

  CloseRange = 300
  CloseRangeSquared = this.CloseRange * this.CloseRange
  MinimumRange = 180
  FarSectorHalfAngle = 45
}

class GlobalConfig {
  EnableLiveCity = true
  EnableNavigationDataLoad = true

  IntervalTick = 50
  StreamingRange = 400.0
  StreamingRangeSquared = this.StreamingRange * this.StreamingRange
  DebugBlip = true
  DebugStats = false
  LiveCity = new LiveCityConfig()
}

export const globalConfig = new GlobalConfig()
  