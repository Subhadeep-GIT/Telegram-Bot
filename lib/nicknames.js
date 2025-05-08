export default function getNickname(username) {
    if (!username) return 'there';
    const nicknames = {
      'subhadeep': 'Nikamma',
      'rahul1998': 'Rahul Bhai',
      'shilpi': 'Shona',
    };
    return nicknames[username.toLowerCase()] || username;
  }