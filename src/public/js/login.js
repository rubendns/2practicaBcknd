const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));

  fetch("/api/jwt/login", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.status === "success") {
        console.log("Cookies generadas:");
                    console.log(document.cookie);
                    alert("Login realizado con exito!");
        window.location.replace("/products");
      } else {
        alert(data.error || "Invalid credentials");
      }
    })
    .catch((error) => {
      console.error("Error when making request:", error);
      alert("Invalid credentials. Please try again.");
    });
});
