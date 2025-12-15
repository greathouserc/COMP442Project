document.addEventListener('DOMContentLoaded', () => {
    const form = <HTMLFormElement> document.getElementById('group-form');
    if (form) {
        form.addEventListener('submit', submitGroup);
    }
});

async function submitGroup(event: Event): Promise<void> {
    event.preventDefault()

    const form = <HTMLFormElement> document.getElementById('group-form')
    const groups = <HTMLDivElement> document.getElementById('groups')

    const formData = new FormData(form);

    fetch(form.action, {
        method: form.method,
        body: formData
    }).then(validateJSON)
    .then((data: any) => {
        const testDiv = <HTMLDivElement> document.createElement('div')
        testDiv.innerText = "Test"
        groups.appendChild(testDiv)
    })

}

