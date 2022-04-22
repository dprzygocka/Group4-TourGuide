function checkSortColumn(column) {
    return column.match(/^[a-z_]+$/);
}

function checkDirection(direction){
    return direction.match(/^(ASC|DESC)$/);
}

function checkDateFormat(date){
    return date.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/);
}

module.exports = {
    checkSortColumn, checkDirection, checkDateFormat
};
  