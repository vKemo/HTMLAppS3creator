    //submit event listener
document.getElementById("bucketForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    //get the bucket name form input field
    let bucketName = document.getElementById("bucketName").value;
    bucketName += "392ujd9jqwk"; //that's for adding text after the bucket name

    //get the value from radio button
    const versioning = document.querySelector('input[name="versioning"]:checked').value;

    const repoOwner = 'vKemo';  // GitHub username
    const repoName = 's3Vars';  // GitHub targeted repo name
    const personalAccessToken = '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';   //GitHub API

    //GitHub (APIURL) for creating a file in the repo
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${bucketName}/terraform.tfvars`;

    // file content with bucket name and versioning settings
    const fileContent = btoa(`bucket_name="${bucketName}"\nversioning=${versioning}`);

    //commit request for the GitHub
    const requestBody = {
        message: `Create terraform.tfvars for bucket ${bucketName} with versioning=${versioning}`,  //commit message
        content: fileContent  //content to be pushed to GitHub that I defined it upper in line 20 and add it to the terraform.tfvars
    };

    //try block to do what the api wants
    try {
        //send a PUT request to GitHub API to create the terraform.tfvars file
        const response = await fetch(apiUrl, {
            method: "PUT",  //HTTP PUT request to create the file
            headers: {
                "Authorization": `token ${personalAccessToken}`,  //API token for authentication
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(requestBody)  //send the request body in JSON format as we defined in the content type
        });

        //check if the API response is successful
        if (response.ok) {
            //display a message asking the user to verify bucket creation
            document.getElementById("result").textContent = `Please verify that you want to create a bucket`;

            //show the jenkins button after pressing the create bucket button and all is good without errors
            document.getElementById("triggerJenkins").style.display = 'block';

            //add a click listener to the jenkins button
            document.getElementById("triggerJenkins").addEventListener("click", function () {
                //trigger the Jenkins with the bucket name
                triggerJenkinsPipeline(bucketName);
            });
        } else {
            //to display if there is an existent beucket on the Github on the UI
            const error = await response.json();
            document.getElementById("result").textContent = `Error: The Bucket already exist`; 
        }
    } catch (error) {
        //dissplay any network or API errors and display the error message
        document.getElementById("result").textContent = `Error: ${error.message}`;
    }
});

//function to trigger Jenkins pipeline after bucket creation
async function triggerJenkinsPipeline(bucketName) {
    //jenkins API URL to build with parameters
    const jenkinsUrl = "http://localhost:8080/job/GitHubs3.2/buildWithParameters";
    
    //jenkins user credentials block
    const jenkinsUser = "kamaher";  // Jenkins username
    const jenkinsToken = "11ed84caf58222739a2f68082b9b676100";  // Jenkins API

    //to edit the params and build with it
    const params = new URLSearchParams({
        DIR_NAME: bucketName  //the bucket name passed as a parameter to the Jenkins job
    });

    //try block to do what jenkins api want
    try {
        //send a POST request to build the Jenkins pipeline with the bucket name as a parameter
        const response = await fetch(`${jenkinsUrl}?${params.toString()}`, {
            method: "POST",  //HTTP POST request to trigger the build
            headers: {
                "Authorization": "Basic " + btoa(`${jenkinsUser}:${jenkinsToken}`)  //jenkins authentication
            }
        });

        //check if the jenkins API response is successful
        if (response.ok) {
            //display the response from jenkins
            const responseText = await response.text();  
            console.log("Response from Jenkins:", responseText);  //display the response to the console
            
            //inform the user that the bucket will be ready soon
            document.getElementById("result").textContent = `Your Bucket is ready to use after 30 seconds`;
        } else {
            //display a message to ask the user to try again
            document.getElementById("result").textContent = `Try again please`;

            //log the error details from the response
            const responseText = await response.text();  
            console.log("Error details:", responseText);
        }
    } catch (error) {
        //catch any errors during the Jenkins API request and display the error message
        document.getElementById("result").textContent = `Error: ${error.message}`;
        console.error("Error triggering Jenkins:", error);  //display the error details to the console
    }
}
