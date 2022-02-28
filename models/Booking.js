class Booking {
    constructor(numberOfSpots, totalPrice, dateTime, customer, schedule){
        this.numberOfSpots = numberOfSpots;
        this.totalPrice = totalPrice;
        this.dateTime = dateTime;
        this.customer = customer; //name, surname, id, Object
        this.schedule = schedule; //schedule object, id
    }
}

module.exports = {Booking};