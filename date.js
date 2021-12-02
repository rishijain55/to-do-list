module.exports = function date() {
  let today = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  day = today.toLocaleDateString("en-US", options);
  return day;
};
