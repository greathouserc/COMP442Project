document.addEventListener("DOMContentLoaded", async () => {
    loadResources();
});

// define a set of interfaces that matches the races API index
interface ResourceStub {
    url: string;
}
interface ResourceIndex {
    count: number;
    results: Array<ResourceStub>;
}

// define an interface that at least partially matches the races API details
interface Resource {
   subURL: string;
}

async function loadResources() {
    // determine the URL for fetching the DnD race index
    const indexURL = "https://localhost:5000/resource_list/";
    
    // fetch the race index and assert that it matches the declared interface
    const indexResponse = await fetch(indexURL);
    const index = <ResourceIndex> await validateJSON(indexResponse);
    const resourceTable = <HTMLTableElement> document.getElementById("resource-table");
    // for each for each of those race stubs . . .
    for (const stub of index.results) {
        const row = resourceTable.insertRow();
        await fetchResource(stub, row);
    }
}

async function fetchResource(stub: ResourceStub, row: HTMLTableRowElement){
    const raceTable = <HTMLTableElement> document.getElementById("dnd-race-table");
    const baseURL =  "https://www.youtube.com/embed/";
    const indexURL = `${baseURL}${stub.url}`;
    // fetch the full data for this race
    const response = await fetch(`${baseURL}${stub.url}`);
    const details = <Resource> await validateJSON(response);
    const vid = row.insertCell();
    const iframe = document.createElement('iframe');
    iframe.width="280";
    iframe.height="158";
    iframe.src= indexURL;
    iframe.title="YouTube video player";
    vid.appendChild(iframe);
}

async function validateJSON(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}