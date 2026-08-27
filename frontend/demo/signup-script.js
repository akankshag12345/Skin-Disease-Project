// Particle background
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const colors = ['#ff0080','#ff8c00','#00cccc','#ffffff'];

class Particle {
  constructor(){
    this.x = Math.random()*canvas.width;
    this.y = Math.random()*canvas.height;
    this.size = Math.random()*3 + 1;
    this.speedX = Math.random()*1 - 0.5;
    this.speedY = Math.random()*1 - 0.5;
    this.color = colors[Math.floor(Math.random()*colors.length)];
  }
  update(){
    this.x += this.speedX;
    this.y += this.speedY;
    if(this.x<0||this.x>canvas.width) this.speedX*=-1;
    if(this.y<0||this.y>canvas.height) this.speedY*=-1;
  }
  draw(){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
  }
}

function init(){
  particlesArray=[];
  for(let i=0;i<100;i++){
    particlesArray.push(new Particle());
  }
}
init();

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particlesArray.forEach(p=>{
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize',()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

// Signup function
async function signup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword')?.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  if (confirmPassword && password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      alert("Account created successfully! Please login.");
      // Store email and redirect to login
      localStorage.setItem('userEmail', email);
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
      if (confirmPassword) document.getElementById('signupConfirmPassword').value = '';
      window.location.href = 'login.html';
    } else {
      alert("Signup failed: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Server is offline or connection failed. Make sure the backend is running on port 5000.");
  }
}
