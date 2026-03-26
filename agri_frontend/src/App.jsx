import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/test")   // proxy will send to backend
      .then((res) => res.text())
      .then((data) => {
        setMessage(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Frontend Connected 🚀</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default App;