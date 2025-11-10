document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", (event) => {
            console.log("Login button clicked");
        });
    }
    if (signupBtn) {
        signupBtn.addEventListener("click", (event) => {
            console.log("Sign Up button clicked");
        });
    }
});
