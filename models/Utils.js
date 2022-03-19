function checkSortColumn(column) {
    return column.match(/^[a-z_]+$/);
}

function checkDirection(direction){
    return direction.match(/^(ASC|DESC)$/);
}

module.exports = {
    checkSortColumn, checkDirection
};
  