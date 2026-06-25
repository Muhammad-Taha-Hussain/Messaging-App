export const calculateTime = (inputDateStr) => {
  const inputDate = new Date(inputDateStr);
  const currentDate = new Date();
  const timeFormat = { hour: 'numeric', minute: 'numeric' };
  const dateFormat = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  if (
    inputDate.getUTCDate() === currentDate.getUTCDate() &&
    inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
    inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
  ) {
    return inputDate.toLocaleTimeString('en-US', timeFormat);
  } else if (
    inputDate.getUTCDate() === currentDate.getUTCDate() - 1 &&
    inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
    inputDate.getUTCFullYear() === currentDate.getUTCFullYear()
  ) {
    return 'Yesterday';
  } else if (
    Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24)) > 1 &&
    Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24)) <= 7
  ) {
    const timeDifference = Math.floor((currentDate - inputDate) / (1000 * 60 * 60 * 24));
    const targetDate = new Date();
    targetDate.setDate(currentDate.getDate() - timeDifference);
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return daysOfWeek[targetDate.getDay()];
  }

  return inputDate.toLocaleDateString('en-GB', dateFormat);
};
