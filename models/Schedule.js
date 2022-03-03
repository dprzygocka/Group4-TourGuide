class Schedule {
    constructor(id, noFreeSpaces, dateTime, tour, guide){
        this.id = id;
        this.noFreeSpaces = noFreeSpaces;
        this.dateTime = dateTime;
        this.tour = tour; //destination, duration, description, difficulty
        this.guide = guide; //name, surname
    }
}

module.exports = {Schedule};