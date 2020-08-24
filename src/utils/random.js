import dayjs from 'dayjs';

export function randomString() {
  return Math.random().toString(36).substr(2, 9);
}

export function randomFileName(fileName) {
  return [
    dayjs().format('YYMMDD'),
    randomString(),
    fileName
  ].filter(Boolean).join('/');
}
