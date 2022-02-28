class Rating {
    constructor(id, scheduleId, customerId, rating, comment){
        this.id = id;
        this.scheduleId = scheduleId;
        this.customerId = customerId;
        this.rating = rating;
        this.comment = comment;
    }
}

module.exports = {Rating};