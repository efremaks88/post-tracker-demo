function validDay(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value));
  if (!match) return false;
  const [,day,month,year] = match.map(Number);
  const date = new Date(year,month-1,day);
  return date.getFullYear()===year && date.getMonth()===month-1 && date.getDate()===day;
}
function validBirthday(value) {
  return !value || validDay(String(value)+'.2000');
}
function inputError(message){return Object.assign(new Error(message),{status:400});}
module.exports = {validDay,validBirthday,inputError};
