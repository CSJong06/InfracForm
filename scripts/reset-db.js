import fetch from 'node-fetch';

async function resetDatabase() {
  try {
    const response = await fetch('http://localhost:3000/api/reset', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset database');
    }

    console.log('Database reset successfully:', data);
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

resetDatabase(); 