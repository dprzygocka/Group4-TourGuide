const { User } = require('./User');

class Guide extends User{
    constructor(id, firstName, lastName, email, phone, license, rating) {
        super(id, firstName, lastName, email, phone);
        this.license = license;
        this.rating = rating;
    }
}

module.exports = {
    Guide
};
  