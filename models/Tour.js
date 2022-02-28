class Tour {
    constructor(id, difficulty, price, duration, numberOfSpots, ageLimit, distance, rating, description, placeOfDeparture, placeOfDestination){
        this.id = id;
        this.price = price;
        this.duration = duration;
        this.numberOfSpots = numberOfSpots;
        this.difficulty = difficulty;
        this.ageLimit = ageLimit;
        this.placeOfDeparture = placeOfDeparture;
        this.distance = distance;
        this.description = description;
        this.rating = rating;
        this.placeOfDestination = placeOfDestination;
    }
}

module.exports = {Tour};