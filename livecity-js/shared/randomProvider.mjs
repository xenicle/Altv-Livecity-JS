export class RandomProvider {
    constructor () {
    }
    
    getFloat () {
        return Math.random()
    }
    
    getInt (maxValue) {
        return Math.floor(Math.random() * maxValue)
    }
    
    getIntRange (minValue, maxValue) {
        minValue = Math.ceil(minValue);
        maxValue = Math.floor(maxValue);
        return Math.floor(Math.random() * (maxValue - minValue)) + minValue;
    }
    
    getRandomItem = iterable => iterable.get([...iterable.keys()][Math.floor(Math.random() * iterable.size)])
    
    choice (source) {
        return source[this.getInt(source.length)]
    }
}