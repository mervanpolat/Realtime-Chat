const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');
const angleLabel = document.getElementById('angleLabel');
const radianLabel = document.getElementById('radianLabel'); // **Added Line**
const angleSlider = document.getElementById('angleSlider'); // Hidden range input
const customSlider = document.getElementById('customSlider');
const sliderThumb = document.getElementById('sliderThumb');

// Adjust for high-resolution displays
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

// Set the canvas width and height to the device pixel ratio * CSS size
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

// Scale the drawing context to account for the device pixel ratio
ctx.scale(dpr, dpr);

// Canvas dimensions in CSS pixels
const width = rect.width;
const height = rect.height;
const centerX = width / 2;
const centerY = height / 2;
const radius = 150; // Keep the radius as before

// Function to convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Variable for the current angle
let currentAngle = 0;

// Animation flag and target angle
let animationFrameId;
let targetAngle = 0;

// Function to update the circle based on the angle
function drawCircle(angle) {
  ctx.clearRect(0, 0, width, height);

  // Draw the outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Adjust angle for canvas coordinate system
  const angleInRadians = degreesToRadians(angle);
  const startAngle = 0; // Start at 0 radians (right side of the circle)
  const endAngle = startAngle - angleInRadians; // Subtract to make it counter-clockwise

  // Draw the angle sector (smaller radius)
  const innerRadius = radius * 0.3; // Reduced radius
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle, true); // anticlockwise is true
  ctx.closePath();
  ctx.fillStyle = "#f5a623";
  ctx.fill();

  // Add a black stroke to the orange sector
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw the line indicating the angle
  const x = centerX + radius * Math.cos(endAngle);
  const y = centerY + radius * Math.sin(endAngle);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Add the angle label in degrees
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";

  // Adjust label position to move it away from the black line
  const labelDistance = radius + 20; // Increased to move label further away
  const labelX = centerX + labelDistance * Math.cos(endAngle);
  const labelY = centerY + labelDistance * Math.sin(endAngle);

  ctx.fillText(`${Math.round(angle)}°`, labelX - 10, labelY + 5);

  // Update the displayed angle in degrees in the HTML
  angleLabel.textContent = `Winkel: ${Math.round(angle)}°`;

  // **Added Lines: Update the radian label**
  const radians = degreesToRadians(angle).toFixed(2); // Convert to radians with 2 decimal places
  radianLabel.textContent = `Winkel: ${radians} rad`;
}

// Initialize the slider thumb position
function updateSliderThumb(angle) {
  const sliderWidth = customSlider.offsetWidth;
  const thumbWidth = sliderThumb.offsetWidth;
  const maxAngle = parseInt(angleSlider.max);
  const percentage = (angle / maxAngle) * 100;

  // Calculate thumb position
  sliderThumb.style.left = `${percentage}%`;
}

// Animation function
function animate() {
  // Calculate the difference between current and target angle
  const delta = targetAngle - currentAngle;

  if (Math.abs(delta) > 0.1) {
    // Interpolation for smooth movement
    currentAngle += delta * 0.1; // Adjust speed (0.2 for 20% of the difference per frame)
    drawCircle(currentAngle);
    updateSliderThumb(currentAngle); // Update thumb position during animation
    animationFrameId = requestAnimationFrame(animate);
  } else {
    currentAngle = targetAngle;
    drawCircle(currentAngle);
    updateSliderThumb(currentAngle); // Ensure final position is set
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Function to start the animation only once
function startAnimation() {
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(animate);
  }
}

// Handle thumb dragging
let isDragging = false;

sliderThumb.addEventListener('mousedown', function(e) {
  isDragging = true;
  document.body.style.userSelect = 'none'; // Prevent text selection
  startAnimation();
});

document.addEventListener('mouseup', function(e) {
  if (isDragging) {
    isDragging = false;
    document.body.style.userSelect = 'auto';
  }
});

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;

  const sliderRect = customSlider.getBoundingClientRect();
  let x = e.clientX - sliderRect.left;
  const sliderWidth = customSlider.offsetWidth;
  const thumbWidth = sliderThumb.offsetWidth;

  // Constrain x within the slider bounds
  x = Math.max(thumbWidth / 2, Math.min(x, sliderWidth - thumbWidth / 2));

  // Calculate angle based on thumb position
  const percentage = (x - thumbWidth / 2) / (sliderWidth - thumbWidth);
  const angle = Math.round(percentage * 360);

  // Set target angle
  targetAngle = angle;

  // Start the animation if not already running
  startAnimation();

  // Update the hidden range input
  angleSlider.value = angle;
});

// Optional: Touch support for mobile devices
sliderThumb.addEventListener('touchstart', function(e) {
  isDragging = true;
  document.body.style.userSelect = 'none';
  startAnimation();
}, { passive: false });

document.addEventListener('touchend', function(e) {
  if (isDragging) {
    isDragging = false;
    document.body.style.userSelect = 'auto';
  }
});

document.addEventListener('touchmove', function(e) {
  if (!isDragging) return;
  e.preventDefault(); // Prevent scrolling while dragging

  const touch = e.touches[0];
  const sliderRect = customSlider.getBoundingClientRect();
  let x = touch.clientX - sliderRect.left;
  const sliderWidth = customSlider.offsetWidth;
  const thumbWidth = sliderThumb.offsetWidth;

  // Constrain x within the slider bounds
  x = Math.max(thumbWidth / 2, Math.min(x, sliderWidth - thumbWidth / 2));

  // Calculate angle based on thumb position
  const percentage = (x - thumbWidth / 2) / (sliderWidth - thumbWidth);
  const angle = Math.round(percentage * 360);

  // Set target angle
  targetAngle = angle;

  // Start the animation if not already running
  startAnimation();

  // Update the hidden range input
  angleSlider.value = angle;
}, { passive: false });

// Initial draw
drawCircle(0);
updateSliderThumb(0);
