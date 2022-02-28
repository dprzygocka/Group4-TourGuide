class Booking {
    constructor(numberOfSpots, totalPrice, dateTime, customerId, scheduleId){
        this.numberOfSpots = numberOfSpots;
        this.totalPrice = totalPrice;
        this.dateTime = dateTime;
        this.customerId = customerId;
        this.scheduleId = scheduleId;
    }
}

module.exports = {Booking};