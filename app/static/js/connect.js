document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('group-form');
    if (form) {
        form.addEventListener('submit', submitGroup);
    }
});
async function submitGroup(event) {
    const form = document.getElementById('group-form');
    const groups = document.getElementById('groups');
    const formData = new FormData(form);
    fetch(form.action, {
        method: form.method,
        body: formData
    }).then(validateJSON);
}
