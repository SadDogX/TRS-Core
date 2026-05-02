import jwt from 'jsonwebtoken';

const token = 'asjdfdaslkfjlsdkddss00000ss';

try {
  const decoded = jwt.verify(token, 'asjdfdaslkfjlsdkddss00000ss');
  console.log('OK:', decoded);
} catch(e) {
  console.log('Ошибка:', e.message);
}