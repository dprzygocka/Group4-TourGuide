class Schedule {
    constructor(id, noFreeSpaces, dateTime, tour, guide){
        this.id = id;
        this.noFreeSpaces = noFreeSpaces;
        this.dateTime = dateTime; //split to time and date?
        this.tour = tour;
        this.guide = guide;
    }
}

module.exports = {Schedule};