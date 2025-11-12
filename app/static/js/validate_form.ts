document.addEventListener("DOMContentLoaded", () => {
    // get references to the all input fields
    const pwdField   = <HTMLInputElement> document.getElementById("pwd-input");
    const pwdConfirm = <HTMLInputElement> document.getElementById("pwd-confirm");
    const emailField = <HTMLInputElement> document.getElementById("email-input");
    // run the validator function on any change that could invalidate a field
    pwdField.addEventListener("change", validateLoginForm);
    pwdConfirm.addEventListener("change", validateLoginForm);
    emailField.addEventListener("change", validateLoginForm);
});

function validateLoginForm() {
    // get the email field and validate its contents with regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // TODO: get the email field
    const emailField = <HTMLInputElement> document.getElementById("email-input");
    // TODO: check if it passes the regex
    if (emailRegex.test(emailField.value)) {
        emailField.setCustomValidity(""); // this field is valid 
    }else {
        emailField.setCustomValidity("Enter a valid email address");
    }
    // TODO: update its custom validity based on whether or not it matches

    const pwdField   = <HTMLInputElement> document.getElementById("pwd-input");
    if (pwdField.value.length < 12) {
        pwdField.setCustomValidity("Password must be at least 12 characters long");
    } else {
        pwdField.setCustomValidity("");
    }
    const pwdConfirm = <HTMLInputElement> document.getElementById("pwd-confirm");
    if (pwdField.value === pwdConfirm.value) {
        pwdConfirm.setCustomValidity("");
    } else {
        pwdConfirm.setCustomValidity("Passwords do not match");
    }

}