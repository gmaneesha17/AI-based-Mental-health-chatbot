const API_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
    // If user is already logged in, redirect away from auth pages
    if (localStorage.getItem("clarity_token")) {
        window.location.href = "chat.html";
    }

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const errorMsg = document.getElementById("error-msg");

    function showError(message) {
        if (!errorMsg) return;
        errorMsg.textContent = message;
        errorMsg.classList.remove("error-hidden");
        errorMsg.classList.add("error-visible");
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.detail || "Registration failed");
                }

                const data = await response.json();
                localStorage.setItem("clarity_token", data.access_token);
                window.location.href = "chat.html";
            } catch (err) {
                showError(err.message);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData.toString()
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.detail || "Login failed");
                }

                const data = await response.json();
                localStorage.setItem("clarity_token", data.access_token);
                window.location.href = "chat.html";
            } catch (err) {
                showError(err.message);
            }
        });
    }
});
