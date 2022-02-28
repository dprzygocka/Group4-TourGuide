class Rating {
    constructor(id, scheduleId, customerId, rating, comment){
        this.id = id;
        this.scheduleId = scheduleId;// tour name and date
        this.customerId = customerId; //name, surname
        this.rating = rating;
        this.comment = comment;
    }
}

module.exports = {Rating};