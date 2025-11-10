document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn") as HTMLAnchorElement | null;
    const signupBtn = document.getElementById("signup-btn") as HTMLAnchorElement | null;

    if (loginBtn) {
        loginBtn.addEventListener("click", (event: MouseEvent) => {
           console.log("Login button clicked");
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener("click", (event: MouseEvent) => {
           console.log("Sign Up button clicked");
        });
    }
    
});
