// ES6 JavaScript for client-side functionality

const testApiBtn = document.getElementById('testApiBtn');
const apiResponse = document.getElementById('apiResponse');

testApiBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/hello');
    const data = await response.json();
    
    apiResponse.textContent = `✓ ${data.message}`;
    apiResponse.className = 'success';
  } catch (error) {
    apiResponse.textContent = `✗ Error: ${error.message}`;
    apiResponse.className = 'error';
  }
});

// Log to console when page loads
console.log('🧪 The Lab is ready!');

