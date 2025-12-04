document.addEventListener("DOMContentLoaded", async () => {
    loadResources();
});


interface ResourceStub {
    url: string;
    type: string;
}
interface ResourceIndex {
    count: number;
    results: Array<ResourceStub>;
}


interface Resource {
   subURL: string;
}

async function loadResources() {
    const indexResponse = await fetch("/resource_library");
    const index = <ResourceIndex> await validateJSON(indexResponse);
    
    const advice = document.getElementById("general-advice");
    const health = document.getElementById("medical-health");
    const spiritual = document.getElementById("spiritual-health");
   
    for (const stub of index.results) {
        console.log(stub);
        const baseURL =  "https://www.youtube.com/embed/";
        const indexURL = `${baseURL}${stub.url}`;
       
        const iframe = document.createElement('iframe');
        iframe.width="280";
        iframe.height="158";
        iframe.src= indexURL;
        iframe.title="YouTube video player";
        if(stub.type === "G"){
            advice.appendChild(iframe);
        }
        else if(stub.type === "M"){
            health.appendChild(iframe);
        } else {
            spiritual.appendChild(iframe);
        }
    }
}


async function validateJSON(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}