document.addEventListener("DOMContentLoaded", () => {
    const pwdField = document.getElementById("pwd-input");
    const pwdConfirm = document.getElementById("pwd-confirm");
    const emailField = document.getElementById("email-input");
    if (pwdField) {
        pwdField.addEventListener("change", validateLoginForm);
    }
    if (pwdConfirm) {
        pwdConfirm.addEventListener("change", validateLoginForm);
    }
    if (emailField) {
        emailField.addEventListener("change", validateLoginForm);
    }
});
function validateLoginForm() {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailField = document.getElementById("email-input");
    if (emailField) {
        if (emailRegex.test(emailField.value)) {
            emailField.setCustomValidity("");
        }
        else {
            emailField.setCustomValidity("Enter a valid email address");
        }
    }
    const pwdField = document.getElementById("pwd-input");
    const pwdConfirm = document.getElementById("pwd-confirm");
    if (pwdField) {
        if (pwdField.value.length < 12) {
            pwdField.setCustomValidity("Password must be at least 12 characters long");
        }
        else {
            pwdField.setCustomValidity("");
        }
    }
    if (pwdConfirm && pwdField) {
        if (pwdField.value === pwdConfirm.value) {
            pwdConfirm.setCustomValidity("");
        }
        else {
            pwdConfirm.setCustomValidity("Passwords do not match");
        }
    }
}
