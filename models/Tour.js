class Tour {
    constructor(id, price, duration, numberOfSpots, difficulty, ageLimit, placeOfDeparture, distance, description, rating, placeOfDestination){
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