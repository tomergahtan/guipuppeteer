async function getEndpoint() {
  const response = await fetch("http://localhost:24000/run");
  const data = await response.json();
  return data.endpoint;
}

getEndpoint().then((endpoint) => {
  console.log(endpoint);
});
