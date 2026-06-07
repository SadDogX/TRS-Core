import 'dotenv/config';

async function getAdmin() {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      employeeId: 'E000001', 
      password: 'admin123'  // ← password, не passwordHash
    })
  });
  
  const data = await response.json();
  console.log(data);
}

getAdmin();