const nicknames = {
    '+918141829858': 'Chokli',
    'jane_smith': 'Janu',
    'niikamma': 'Developer',
    'rahul1998': 'Rahul Bhai',
  };
  
  export default function getNickname(username) {
    return nicknames[username] || username;
  }