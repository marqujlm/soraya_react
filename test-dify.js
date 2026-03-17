const body = {
  inputs: {},
  query: "Test",
  response_mode: "streaming",
  user: "react-user"
};

fetch('http://localhost:5173/api/dify/chat-messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer app-msWb9rkFGa2FB5s2TjqtfRAI'
  },
  body: JSON.stringify(body)
}).then(async res => {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while(true) {
    const {value, done} = await reader.read();
    if(done) break;
    console.log(decoder.decode(value));
  }
});
