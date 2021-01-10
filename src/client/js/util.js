function isValidDate(date) {
    return date.match(/^\d{4}-\d{2}-\d{2}$/) != null;
}

export { isValidDate }