const { User } = require('./User');

class Customer extends User{
    constructor(id, firstName, lastName, email, phone, password) {
        super(id, firstName, lastName, email, phone);
        this.password = password;
    }
}

module.exports = {
    Customer
};
  