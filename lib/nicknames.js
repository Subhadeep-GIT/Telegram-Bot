// Define a mapping of usernames to nicknames
const nicknames = {
    'john_doe': 'Johnny',
    'niikamma': 'Nikamma',
    'shilpi123': 'Shilu',
    // add more mappings as needed
  };
  
  // Return the nickname if it exists, else fallback to the username
  export default function getNickname(username) {
    return nicknames[username] || username;
  }